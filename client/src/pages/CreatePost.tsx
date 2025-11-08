import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../api/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
// --- START: Added Icons for better UX (Assuming use of react-icons) ---
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaCalendarAlt,
  FaImage,
  FaEdit,
  FaPlus,
} from "react-icons/fa";

interface Post {
  _id?: string;
  content: string;
  platforms: string[];
  scheduleAt: string;
  imageUrl?: string;
}

// Map platform names to keys, icons, and colors for enhanced UI
const PLATFORM_MAP = [
  { key: "Twitter", name: "Twitter", icon: FaTwitter, color: "text-blue-400" },
  {
    key: "Facebook",
    name: "Facebook",
    icon: FaFacebook,
    color: "text-blue-600",
  },
  {
    key: "Instagram",
    name: "Instagram",
    icon: FaInstagram,
    color: "text-pink-600",
  },
];

// Original list for simple iteration (if needed, but using MAP is better for UI)
const PLATFORMS_KEYS = ["Twitter", "Facebook", "Instagram"];

export const CreatePost = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [post, setPost] = useState<Post>({
    content: "",
    platforms: [],
    scheduleAt: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [platformError, setPlatformError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const MAX_CHARACTERS = 500;
  const contentCharCount = post.content ? post.content.length : 0;
  const isPastSchedule = new Date(post.scheduleAt) <= new Date();

  // Helper to format date for min attribute (ensures only future dates are selectable)
  const getMinDateTime = () => new Date().toISOString().slice(0, 16);

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
          platforms: Array.isArray(data.platforms) ? data.platforms : [], // <-- safe
          scheduleAt: data.scheduleAt ? data.scheduleAt.slice(0, 16) : "",
          imageUrl: data.imageUrl || "",
        });
      } catch (err: any) {
        toast.error(err.message);
        navigate("/posts"); // Redirect on failure to load
      }
    };
    fetchPost();
  }, [id, token, navigate]);

  const handlePlatformChange = (platform: string) => {
    setPlatformError(""); // Clear platform error on interaction
    setPost((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleContentChange = (value: string) => {
    // Client-side validation for content length
    if (value.length > MAX_CHARACTERS) {
      setContentError(`Content limited to ${MAX_CHARACTERS} characters.`);
    } else {
      setContentError("");
    }
    setPost({ ...post, content: value });
  };

  const handleScheduleChange = (value: string) => {
    setPost({ ...post, scheduleAt: value });
    if (new Date(value) <= new Date()) {
      setScheduleError("Schedule time must be in the future.");
    } else {
      setScheduleError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentError("");
    setPlatformError("");
    setScheduleError("");

    // Check Authentication
    if (!token) return toast.error("Not authenticated");

    // --- Validation Checks ---
    const trimmedContent = post.content.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > MAX_CHARACTERS) {
      setContentError("Content is required and max 500 characters.");
      return toast.error("Content error. Check required length.");
    }
    if (!post.platforms || post.platforms.length === 0) {
      setPlatformError("Select at least one platform.");
      return toast.error("Select at least one platform.");
    }
    if (!post.scheduleAt || isPastSchedule) {
      setScheduleError("Schedule date must be in the future.");
      return toast.error("Schedule date must be in the future.");
    }
    // --- End Validation Checks ---

    setLoading(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Payload using the corrected state key: platforms
        body: JSON.stringify({ ...post, content: trimmedContent }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save post");
      }

      toast.success(
        isEditing ? "Post updated successfully" : "Post scheduled successfully!"
      );
      navigate("/posts");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Outer Card Container: Uses subtle shadow and rounded corners */}
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-100">
        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-teal-800 flex items-center">
          {isEditing ? (
            <FaEdit className="mr-3" />
          ) : (
            <FaPlus className="mr-3" />
          )}
          {isEditing ? "Edit Scheduled Post" : "Create New Post"}
        </h2>
        <p className="text-gray-600 mb-6">
          Schedule your content across multiple platforms efficiently.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Content */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Content (Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              className={`w-full border p-3 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 ${
                contentError ? "border-red-500" : "border-gray-300"
              }`}
              rows={6}
              value={post.content}
              onChange={(e) => handleContentChange(e.target.value)}
              maxLength={MAX_CHARACTERS}
              required
              placeholder="What do you want to share with the world?"
            />
            <div className="flex justify-between mt-2 text-sm">
              <p
                className={
                  contentError ? "text-red-500 font-semibold" : "text-gray-500"
                }
              >
                {contentError || `Maximum ${MAX_CHARACTERS} characters.`}
              </p>
              <p
                className={
                  contentCharCount > MAX_CHARACTERS - 50
                    ? "text-red-500 font-medium"
                    : "text-gray-500"
                }
              >
                {contentCharCount}/{MAX_CHARACTERS}
              </p>
            </div>
          </div>

          {/* 2. Platform Selection */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platforms <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {PLATFORM_MAP.map((p) => {
                const isSelected = post.platforms.includes(p.key);
                return (
                  // Custom button/badge component for better UX than a simple checkbox
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handlePlatformChange(p.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition duration-200
                      ${
                        isSelected
                          ? "bg-teal-500 border-teal-500 text-white shadow-md"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-300"
                      }
                    `}
                  >
                    <p.icon
                      className={`text-xl ${
                        isSelected ? "text-white" : p.color
                      }`}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
            {platformError && (
              <p className="text-red-500 text-sm mt-2 font-semibold">
                {platformError}
              </p>
            )}
          </div>

          {/* 3. Schedule Date & Time */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label
              htmlFor="scheduleAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <FaCalendarAlt className="inline mr-2 text-teal-600" /> Schedule
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="scheduleAt"
              type="datetime-local"
              className={`w-full border p-3 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 ${
                scheduleError ? "border-red-500" : "border-gray-300"
              }`}
              value={post.scheduleAt}
              min={getMinDateTime()}
              onChange={(e) => handleScheduleChange(e.target.value)}
              required
            />
            {scheduleError && (
              <p className="text-red-500 text-sm mt-2 font-semibold">
                {scheduleError}
              </p>
            )}
          </div>

          {/* 4. Image URL */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <FaImage className="inline mr-2 text-teal-600" /> Image URL
              (optional)
            </label>
            <input
              id="imageUrl"
              type="text"
              className="w-full border p-3 rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              value={post.imageUrl}
              onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
              placeholder="Paste your image link here..."
            />
            {post.imageUrl && (
              <div className="mt-4 p-2 bg-white rounded-lg border border-gray-200 inline-block">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Image Preview:
                </p>
                {/* Basic Image Preview: Good UX for checking the link */}
                <img
                  src={post.imageUrl}
                  alt="Image Preview"
                  className="max-h-32 w-auto object-contain rounded-md"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  onLoad={(e) => (e.currentTarget.style.display = "block")}
                  style={{ display: "block" }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`
              w-full py-3 rounded-xl text-lg font-semibold shadow-lg transition duration-300
              ${
                loading
                  ? "bg-teal-300 cursor-not-allowed"
                  : "bg-yellow-500 text-teal-900 hover:bg-yellow-400 hover:shadow-xl"
              }
            `}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditing ? "Updating..." : "Scheduling..."}
              </span>
            ) : isEditing ? (
              "Update Post"
            ) : (
              "Schedule Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
