// post.router.js - CORRECTED
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { createPost, getPosts, updatePost, deletePost, getPost } from "./post.controller.js";
import Post from "./post.model.js"; 

const router = Router();

router.use(authMiddleware);

// ✅ STATS ROUTE - Enhanced to calculate TOTAL and simple PLATFORM counts
router.get("/stats", async (req, res) => {
    // 1. Get counts by status
    const scheduled = await Post.countDocuments({ user: req.user.id, status: "scheduled" });
    const posted = await Post.countDocuments({ user: req.user.id, status: "published" });
    const draft = await Post.countDocuments({ user: req.user.id, status: "draft" });
    const failed = await Post.countDocuments({ user: req.user.id, status: "failed" });
    
    // 2. Get TOTAL count
    const total = await Post.countDocuments({ user: req.user.id });
    
    // 3. Simple Platform Aggregation (Requires MongoDB Aggregation Framework for scale)
    // For a quick fix, let's use the MongoDB Aggregation Pipeline to get the platform breakdown
    const platformBreakdown = await Post.aggregate([
        { $match: { user: req.user.id, platforms: { $exists: true, $not: { $size: 0 } } } }, // Filter by user and posts that have platforms
        { $unwind: "$platforms" }, // Deconstruct the platforms array
        { $group: { _id: "$platforms", count: { $sum: 1 } } }, // Group and count
        { $sort: { count: -1 } }
    ]);

    // Format the platform data into the key-value object expected by the frontend
    const platforms = platformBreakdown.reduce((acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
    }, {});
    
    // Ensure "posted" status is consistent with the frontend's "published" key
    res.json({ 
        total, 
        scheduled, 
        posted, // Use 'published' to match the frontend
        draft, 
        failed,
        platforms // Include platform data
    });
});

// The rest of your routes
router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/:id", getPost);

export default router;

// NOTE: I also added { user: req.user.id } to the countDocuments queries 
// to ensure users only count their own posts, which is essential for security.