import mongoose from "mongoose";

const publicationLogSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  publishedAt: { type: Date, default: Date.now },
});

export default mongoose.model("PublicationLog", publicationLogSchema);
