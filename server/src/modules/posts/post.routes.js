import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createPost, getPosts, updatePost, deletePost , getPost } from "./post.controller.js";
import Post from "./post.model.js"; // Make sure this is imported!

const router = Router();

router.use(authMiddleware);

// ✅ STATS MUST BE BEFORE ID ROUTE
router.get("/stats", async (req, res) => {
  const scheduled = await Post.countDocuments({ status: "scheduled" });
  const posted = await Post.countDocuments({ status: "published" });
  const draft = await Post.countDocuments({ status: "draft" });
  const failed = await Post.countDocuments({ status: "failed" });

  res.json({ scheduled, posted, draft, failed });
});

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/:id", getPost);

export default router;
