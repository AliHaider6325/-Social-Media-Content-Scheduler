import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    maxlength: 500,
    required: true
  },
  platforms: [{
    type: String,
    enum: ["twitter", "facebook", "instagram"],
    required: true
  }],
  scheduleAt: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "published", "failed"],
    default: "scheduled"
  }
}, { timestamps: true });

postSchema.index({ scheduleAt: 1 });
postSchema.index({ createdAt: 1 });


export default mongoose.model("Post", postSchema);
