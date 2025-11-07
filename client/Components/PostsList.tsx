// PostsList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Post {
  _id: string;
  content: string;
  platform: string[];
  scheduleAt: string;
  status: string;
}

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null); // For "Read more"
  const limit = 10;

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (page: number) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `http://localhost:5000/api/posts?page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch posts");
      }

      const data = await res.json();
      setPosts(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete post");
      }
      toast.success("Post deleted successfully");
      fetchPosts(page); // refresh
    } catch (err: any) {
      toast.error(err.message || "Error deleting post");
    }
  };

  const truncate = (text: string, length = 50) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  };

  const toggleExpand = (id: string) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Posts</h2>
      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && posts.length === 0 && <p>No posts found.</p>}

      {!loading && posts.length > 0 && (
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="border px-2 py-1">Content</th>
              <th className="border px-2 py-1">Platforms</th>
              <th className="border px-2 py-1">Scheduled At</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id}>
                <td className="border px-2 py-1">
                  <div className="max-w-xs">
                    {expandedPostId === post._id
                      ? post.content
                      : truncate(post.content)}
                    {post.content.length > 50 && (
                      <button
                        onClick={() => toggleExpand(post._id)}
                        className="ml-1 text-blue-500 hover:underline"
                      >
                        {expandedPostId === post._id
                          ? "Show less"
                          : "Read more"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="border px-2 py-1">
                  {post.platform?.join(", ")}
                </td>
                <td className="border px-2 py-1">
                  {new Date(post.scheduleAt).toLocaleString()}
                </td>
                <td className="border px-2 py-1">{post.status}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
