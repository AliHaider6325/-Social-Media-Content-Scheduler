// tests/posts.test.js
// src/tests/auth.test.js
import request from "supertest";
import app from "../app.js"; // <-- remove the extra "src/"


let token; // Will store JWT for authenticated requests
let postId; // Will store a post ID for later tests

beforeAll(async () => {
  // Login first to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "testuser@example.com", password: "12345678" });
  token = res.body.token;
});

describe("Post Endpoints", () => {
  it("should create a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "This is a test post",
        platforms: ["Twitter", "Facebook"],
        scheduleAt: new Date(Date.now() + 60 * 1000), // 1 min in the future
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.status).toBe("scheduled");

    postId = res.body._id; // store for next test
  });

  it("should fetch posts", async () => {
    const res = await request(app)
      .get("/api/posts?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Optional: check if our created post is in response
    const found = res.body.find((p) => p._id === postId);
    expect(found).toBeDefined();
  });
});
