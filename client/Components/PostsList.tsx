// PostsList.tsx - Enhanced UI/UX
import { useState, useEffect, useCallback, useMemo, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaList,
  FaPencilAlt,
  FaTimesCircle,
} from "react-icons/fa";

interface Post {
  _id: string;
  content: string;
  platforms: string[];
  scheduleAt: string;
  status: "pending" | "scheduled" | "published" | "draft" | "failed"; // Added explicit status types
}

// Define Status Visuals (Consistent with Analytics and Dashboard)
const STATUS_VISUALS = {
  pending: {
    label: "Pending",
    icon: FaClock,
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    border: "border-yellow-500",
  },
  scheduled: {
    label: "Scheduled",
    icon: FaCalendarAlt,
    color: "text-teal-700",
    bg: "bg-teal-100",
    border: "border-teal-500",
  },
  published: {
    label: "Published",
    icon: FaCheckCircle,
    color: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-500",
  },
  draft: {
    label: "Draft",
    icon: FaPencilAlt,
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-500",
  },
  failed: {
    label: "Failed",
    icon: FaTimesCircle,
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-500",
  },
};

// Map platform names to icons
const PLATFORM_ICONS: { [key: string]: JSX.Element } = {
  twitter: <FaTwitter className="text-blue-400" />,
  facebook: <FaFacebook className="text-blue-600" />,
  instagram: <FaInstagram className="text-pink-600" />,
};

// Helper component for Platform Icons
const PlatformBadges = ({ platforms }: { platforms: string[] }) => (
  <div className="flex gap-2">
    {platforms.map((p) => (
      <span key={p} title={p} className="p-1 rounded-full bg-white shadow-sm">
        {PLATFORM_ICONS[p.toLowerCase()] || (
          <FaExternalLinkAlt className="text-gray-500" />
        )}
      </span>
    ))}
  </div>
);

// --- Component Start ---
export function PostsList() {
  const [filter, setFilter] = useState<Post["status"] | "all">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>(
    {}
  );
  const limit = 10;
  const navigate = useNavigate();

  // Use a map of the keys we need to display filters dynamically
  const FILTER_OPTIONS: { key: Post["status"] | "all"; label: string }[] = [
    { key: "all", label: "All Posts" },
    { key: "scheduled", label: "Scheduled" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "failed", label: "Failed" },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const truncate = (text: string, length = 150) => {
    if (!text) return "";
    return text.length <= length ? text : text.slice(0, length) + "...";
  };

  // Memoized URL calculation
  const API_BASE_URL = "http://localhost:5000/api/posts";

  const fetchPosts = useCallback(
    async (currentPage: number, currentFilter: string) => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        // FIX: Integrate filter into the API call
        const statusQuery =
          currentFilter === "all" ? "" : `&status=${currentFilter}`;

        const res = await fetch(
          `${API_BASE_URL}?page=${currentPage}&limit=${limit}${statusQuery}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to fetch posts");
        }

        const data = await res.json();
        setPosts(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || 1);

        // Reset expanded state on new data fetch
        setExpandedPosts({});
      } catch (err: any) {
        console.error("Failed to fetch posts:", err);
        setError(err.message || "Something went wrong");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  ); // Dependencies are stable

  // Effect to refetch posts when page or filter changes
  useEffect(() => {
    fetchPosts(page, filter);
  }, [page, filter, fetchPosts]);

  const handleDelete = async (id: string) => {
    // Replaced standard confirm with toast confirmation for better UX
    toast(
      (t) => (
        <div className="text-center">
          <p className="font-semibold text-lg mb-2">Confirm Deletion</p>
          <p className="text-sm mb-4">
            Are you sure you want to permanently delete this post?
          </p>
          <button
            className="bg-red-600 text-white px-4 py-1 rounded-md mr-2 hover:bg-red-700 transition"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/${id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.message || "Failed to delete post");
                }
                toast.success("Post deleted successfully");
                fetchPosts(page, filter); // Refresh list
              } catch (err: any) {
                toast.error(err.message || "Error deleting post");
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-1 rounded-md hover:bg-gray-400 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      ),
      { duration: 10000 }
    ); // Keep toast open longer for confirmation
  };

  // Handle filter change and reset to page 1
  const handleFilterChange = (newFilter: Post["status"] | "all") => {
    setFilter(newFilter);
    setPage(1); // Crucial: Reset page to 1 on filter change
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header and Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-teal-800 flex items-center">
          <FaList className="mr-3 text-teal-600" /> All Posts
        </h1>
        <Link
          to="/posts/create"
          className="bg-yellow-500 text-teal-900 py-2 px-4 rounded-full font-semibold shadow-md hover:bg-yellow-400 transition duration-300 flex items-center gap-2"
        >
          <FaPlus /> Create Post
        </Link>
      </div>

      {/* --- Filter Buttons --- */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-inner border border-gray-100 flex flex-wrap gap-3">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleFilterChange(opt.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 shadow-sm
              ${
                filter === opt.key
                  ? "bg-teal-600 text-white shadow-md hover:bg-teal-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* --- Loading, Error, and Empty States --- */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-xl shadow animate-pulse border-l-4 border-gray-200"
            ></div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-teal-400">
          <p className="font-medium text-gray-600">
            No posts found for the **"{filter}"** status.
          </p>
        </div>
      )}

      {/* --- Posts List (Card Rows) --- */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts
            // Removed client-side filter since it's now handled by the API call
            .map((post) => {
              const visual =
                STATUS_VISUALS[post.status] || STATUS_VISUALS.draft;
              const isExpanded = expandedPosts[post._id];

              return (
                <div
                  key={post._id}
                  className={`bg-white p-5 rounded-xl shadow-lg flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition duration-200 hover:shadow-xl border-l-4 ${visual.border}`}
                >
                  {/* 1. Content */}
                  <div className="md:col-span-5 w-full">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Content
                    </p>
                    <div
                      className={`text-gray-800 text-sm whitespace-pre-wrap transition-all duration-300 ${
                        isExpanded
                          ? "max-h-52 overflow-y-auto p-3 rounded-xl from-white to-gray-50 border border-gray-200 shadow-inner backdrop-blur-sm"
                          : ""
                      }`}
                    >
                      {isExpanded ? post.content : truncate(post.content, 10)}
                      {post.content.length > 10 && (
                        <button
                          onClick={() => toggleExpanded(post._id)}
                          className="text-teal-600 ml-2 text-xs font-semibold hover:underline hover:text-teal-800 transition-all duration-200"
                        >
                          {isExpanded ? " Show less" : " Read more"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Platforms */}
                  <div className="md:col-span-2 w-full">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Platforms
                    </p>
                    <PlatformBadges platforms={post.platforms} />
                  </div>

                  {/* 3. Schedule Time */}
                  <div className="md:col-span-3 w-full text-left md:text-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Scheduled Date
                    </p>
                    <p className="font-semibold text-gray-800">
                      {new Date(post.scheduleAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  {/* 4. Status */}
                  <div className="md:col-span-1 w-full text-left md:text-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center justify-center ${visual.bg} ${visual.color}`}
                    >
                      <visual.icon className="mr-1" /> {visual.label}
                    </span>
                  </div>

                  {/* 5. Actions */}
                  <div className="md:col-span-1 w-full flex md:flex-col gap-2 justify-end items-end md:items-start">
                    <Link
                      to={`/posts/edit/${post._id}`}
                      className="text-teal-600 hover:text-teal-800 transition text-sm font-medium flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-red-500 hover:text-red-700 transition text-sm font-medium flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 disabled:opacity-50 transition duration-200 font-semibold"
          >
            Prev
          </button>
          <span className="text-lg font-medium text-gray-700">
            Page **{page}** of **{totalPages}**
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 disabled:opacity-50 transition duration-200 font-semibold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
