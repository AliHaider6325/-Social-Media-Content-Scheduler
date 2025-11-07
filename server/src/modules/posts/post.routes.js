import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createPost, getPosts, updatePost, deletePost , getPost } from "./post.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/:id", getPost);


router.get("/stats", async (req, res) => {
  const scheduled = await Post.countDocuments({ status: "scheduled" });
  const posted = await Post.countDocuments({ status: "posted" });
  const draft = await Post.countDocuments({ status: "draft" });
  const failed = await Post.countDocuments({ status: "failed" });

  res.json({ scheduled, posted, draft, failed });
});
export default router;
