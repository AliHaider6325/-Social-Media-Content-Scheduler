import Post from "./post.model.js";

export const createPost = async (req, res) => {
  try {
    const { content, platforms, scheduleAt, imageUrl } = req.body;

    const newPost = await Post.create({
      user: req.user._id,
      content,
      platforms,
      scheduleAt,
      imageUrl
    });

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export async function getPosts(req, res) {
  try {
    let { page = 1, limit = 10, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = { user: req.user.id }; // only user own posts

    if (status) query.status = status; // optional filter

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return res.json({
      data: posts,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error getting posts" });
  }
}


export async function updatePost(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, user: req.user.id });
    if (!post) return res.status(404).json({ message: "Post not found or not owned" });

    if (post.status === "published")
      return res.status(400).json({ message: "Cannot edit published post" });

    Object.assign(post, req.body);
    await post.save();

    return res.json({ message: "Post updated", post });
  } catch (err) {
    return res.status(500).json({ message: "Error updating post" });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findOneAndDelete({ _id: id, user: req.user.id });
    if (!post) return res.status(404).json({ message: "Post not found or not owned" });

    return res.json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting post" });
  }
}
export async function getPost(req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, user: req.user.id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching post" });
  }
}