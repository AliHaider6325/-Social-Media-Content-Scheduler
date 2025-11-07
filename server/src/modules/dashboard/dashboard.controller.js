import Post from "../posts/post.model.js";

export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    const totalPosts = await Post.countDocuments({ user: userId });
    const scheduledCount = await Post.countDocuments({ user: userId, status: "scheduled" });
    const publishedCount = await Post.countDocuments({ user: userId, status: "published" });

    // posts by platform
    const byPlatform = await Post.aggregate([
      { $match: { user: req.user.id } },
      { $unwind: "$platform" },
      { $group: { _id: "$platform", count: { $sum: 1 } } },
    ]);

    const postsByPlatform = {};
    byPlatform.forEach(p => (postsByPlatform[p._id] = p.count));

    return res.json({ totalPosts, scheduledCount, publishedCount, postsByPlatform });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching stats" });
  }
}

export async function getUpcoming(req, res) {
  try {
    const upcoming = await Post.find({ user: req.user.id, status: "scheduled" })
      .sort({ scheduleAt: 1 })
      .limit(5)
      .lean();

    return res.json({ upcoming });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching upcoming posts" });
  }
}
