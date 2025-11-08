import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createPost, getPosts, updatePost, deletePost , getPost } from "./post.controller.js";
import Post from "./post.model.js"; // Make sure this is imported!

const router = Router();

router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  const userId = req.user._id;

  const total = await Post.countDocuments({ user: userId });
  const scheduled = await Post.countDocuments({ status: "scheduled", user: userId });
  const posted = await Post.countDocuments({ status: "published", user: userId });
  const draft = await Post.countDocuments({ status: "draft", user: userId });
  const failed = await Post.countDocuments({ status: "failed", user: userId });

  res.json({ total, scheduled, posted, draft, failed });
});


router.get("/platforms", async (req, res) => {
  const userId = req.user._id;

  const Twitter = await Post.countDocuments({ platforms: "Twitter", user: userId });
  const Facebook = await Post.countDocuments({ platforms: "Facebook", user: userId });
  const Instagram = await Post.countDocuments({ platforms: "Instagram", user: userId });

  res.json({ Twitter, Facebook, Instagram });
});



router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/:id", getPost);

export default router;
