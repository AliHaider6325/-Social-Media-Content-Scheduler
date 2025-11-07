import cron from "node-cron";
import Post from "../modules/posts/post.model.js";
import PublicationLog from "../modules/posts/publicationLog.model.js";

cron.schedule("* * * * *", async () => {
  try {

    const now = new Date();

    const posts = await Post.find({
      status: "scheduled",
      scheduleAt: { $lte: now }
    }).sort({ createdAt: 1 }).limit(10);

    for (const p of posts) {
      p.status = "published";
      await p.save();

      await PublicationLog.create({ post: p._id });
    }

    if (posts.length > 0) console.log(`Published ${posts.length} post(s)`);
  } catch (err) {
    console.error("Scheduler Error", err);
  }
});
