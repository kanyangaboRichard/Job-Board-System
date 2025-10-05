import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

interface JwtPayload {
  id: number;
  role: string;
}

// ✅ JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload: JwtPayload, done) => {
      try {
        // Re-fetch user to ensure we have up-to-date role and info
        const result = await pool.query(
          "SELECT id, email, role, name FROM users WHERE id = $1",
          [payload.id]
        );

        const user = result.rows[0];
        if (!user) return done(null, false);

        // ✅ Return full user object to Passport
        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        });
      } catch (err) {
        console.error("❌ JWT verification error:", err);
        return done(err, false);
      }
    }
  )
);

// ✅ Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3005/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : undefined;

        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        // Check if user already exists
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        let user = result.rows[0];

        // If user doesn't exist, create new one
        if (!user) {
          const insert = await pool.query(
            "INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name",
            [email, "", "user", profile.displayName || "Google User"]
          );
          user = insert.rows[0];
        }

        // Optional: only log Google auth once per login
        if (process.env.NODE_ENV === "development") {
          console.log(`[Google] Authenticated: ${user.email}`);
        }

        return done(null, user);
      } catch (err) {
        console.error(" Google Strategy error:", err);
        return done(err, false);
      }
    }
  )
);

export default passport;
