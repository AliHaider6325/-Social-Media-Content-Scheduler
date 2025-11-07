// CreateEditPost.tsx
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

const PLATFORMS = ["facebook", "twitter", "instagram"]; // lowercase for backend

export const CreateEditPost = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState<Post>({
    content: "",
    platform: [],
    scheduleAt: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch post for editing
  useEffect(() => {
    if (!id || !token) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();

        setPost({
          content: data.content || "",
          platform: Array.isArray(data.platform) ? data.platform : [],
          scheduleAt: data.scheduleAt ? data.scheduleAt.slice(0, 16) : "",
          imageUrl: data.imageUrl || "",
        });
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    fetchPost();
  }, [id, token]);

  const handlePlatformChange = (platform: string) => {
    setPost((prev) => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter((p) => p !== platform)
        : [...prev.platform, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !post.content ||
      post.content.trim().length === 0 ||
      post.content.length > 500
    )
      return toast.error("Content is required and max 500 characters");

    if (post.platform.length === 0)
      return toast.error("Select at least one platform");

    if (!post.scheduleAt || new Date(post.scheduleAt) <= new Date())
      return toast.error("Schedule date must be in the future");

    setLoading(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;

      // Normalize platforms to lowercase for backend
      const payload = {
        ...post,
        content: post.content.trim(),
        platform: post.platform.map((p) => p.toLowerCase()),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save post");
      }

      toast.success(
        id ? "Post updated successfully" : "Post created successfully"
      );
      navigate("/posts");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Post" : "Create Post"}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content */}
        <div>
          <label className="block mb-1">Content</label>
          <textarea
            className="w-full border p-2 rounded"
            value={post.content || ""}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            maxLength={500}
            required
          />
          <p className="text-sm text-gray-500">
            {(post.content || "").length}/500 characters
          </p>
        </div>

        {/* Platforms */}
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
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block mb-1">Schedule Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={post.scheduleAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setPost({ ...post, scheduleAt: e.target.value })}
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block mb-1">Image URL (optional)</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={post.imageUrl}
            onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
          />
        </div>

        {/* Submit */}
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
