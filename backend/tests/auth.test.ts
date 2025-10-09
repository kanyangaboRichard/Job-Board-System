import request from "supertest";
import app from "../src/app";
import pool from "../src/config/db";

describe(" AUTH API", () => {
    
  // Clean DB before tests (optional but good practice)
  beforeEach(async () => {
    await pool.query("DELETE FROM users;");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should reject duplicate registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "User A",
        email: "dupe@example.com",
        password: "123456",
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User A",
        email: "dupe@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(400);
  });

  it("should login an existing user", async () => {
    // register first
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "123456",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("should reject invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fake@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
  });
});
