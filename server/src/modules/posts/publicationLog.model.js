import mongoose from "mongoose";

const publicationLogSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['published', 'failed'], default: 'published' },
  message: { type: String }, // optional failure reason
});

export default mongoose.model("PublicationLog", publicationLogSchema);
