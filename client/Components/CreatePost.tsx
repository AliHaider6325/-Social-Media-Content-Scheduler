// CreatePost.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../src/api/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Post {
  _id?: string;
  content: string;
  platform: string[];
  scheduleAt: string;
  imageUrl?: string;
}

const PLATFORMS = ["Twitter", "Facebook", "Instagram"];

export const CreateEditPost = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // if editing, id will exist

  const [post, setPost] = useState<Post>({
    content: "",
    platform: [],
    scheduleAt: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If editing, fetch the existing post
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost({
          content: data.content,
          platform: data.platform,
          scheduleAt: data.scheduleAt.slice(0, 16), // for input type=datetime-local
          imageUrl: data.imageUrl || "",
        });
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchPost();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!post.content || post.content.length > 500)
      return toast.error("Content is required and max 500 characters");

    if (post.platform.length === 0)
      return toast.error("Select at least one platform");

    if (!post.scheduleAt || new Date(post.scheduleAt) <= new Date())
      return toast.error("Schedule date must be in the future");

    setLoading(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save post");
      }

      navigate("/posts"); // go back to posts list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platform: string) => {
    setPost((prev) => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter((p) => p !== platform)
        : [...prev.platform, platform],
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Post" : "Create Post"}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            className="w-full border p-2 rounded"
            value={post.content || ""} // fallback if undefined
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            maxLength={500} // Prevent typing more than 500
            required
          />
          <p className="text-sm text-gray-500">
            {(post.content || "").length}/500 characters
          </p>
        </div>

        <div>
          <label className="block mb-1">Platforms</label>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <label key={p} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={post.platform.includes(p)}
                  onChange={() => handlePlatformChange(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">Schedule Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={post.scheduleAt}
            onChange={(e) => setPost({ ...post, scheduleAt: e.target.value })}
            maxLength={500}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Image URL (optional)</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={post.imageUrl}
            onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Saving..." : id ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
};
