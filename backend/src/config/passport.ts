import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// ---------- JWT Strategy ----------
interface JwtPayload {
  id: number;
  role: string;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload: JwtPayload, done) => {
      try {
        const result = await pool.query("SELECT id, email, role FROM users WHERE id=$1", [payload.id]);
        const user = result.rows[0];
        if (!user) return done(null, false);
        return done(null, { id: user.id, role: user.role });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ---------- Google Strategy ----------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3005/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if user exists
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        let user = result.rows[0];

        if (!user) {
          // create new user if not found
          const insert = await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role",
            [email, "", "user"]
          );
          user = insert.rows[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
