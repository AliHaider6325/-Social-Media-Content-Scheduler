import cron from "node-cron";
import Post from "../modules/posts/post.model.js";
import PublicationLog from "../modules/posts/publicationLog.model.js";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const posts = await Post.find({
      status: "scheduled",
      scheduleAt: { $lte: now },
    }).sort({ scheduleAt: 1, createdAt: 1 }).limit(10);

    for (const post of posts) {
      try {
        post.status = "published";
        post.publishedAt = new Date();
        await post.save();

        await PublicationLog.create({
          post: post._id,
          publishedAt: new Date(),
          status: "published", // optional, can add to your schema
        });

        console.log(`✅ Published post ${post._id}`);
      } catch (err) {
        console.error(`❌ Failed to publish post ${post._id}:`, err.message);

        // mark as failed
        post.status = "failed";
        await post.save();

        // log failure
        await PublicationLog.create({
          post: post._id,
          status: "failed",
          message: err.message,
        });
      }
    }

    if (posts.length > 0) console.log(`Published ${posts.length} post(s)`);
  } catch (err) {
    console.error("Scheduler Error", err);
  }
});
