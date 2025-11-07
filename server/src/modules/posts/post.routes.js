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

export default router;
