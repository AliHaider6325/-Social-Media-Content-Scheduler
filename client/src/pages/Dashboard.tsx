// Dashboard.tsx - Corrected UI/UX
import { useState, useEffect, useCallback, type JSX } from "react";
// Assuming you have access to icons (e.g., react-icons/fa)
import {
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaHashtag,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaCalendarAlt,
} from "react-icons/fa";

interface Post {
  _id: string;
  content: string;
  platforms: string[];
  scheduleAt: string;
  status: string;
}

// Helper component for formatting Platforms with Icons
const PlatformBadges = ({ platforms }: { platforms: string[] }) => {
  const PLATFORM_ICONS: { [key: string]: JSX.Element } = {
    twitter: <FaTwitter className="text-blue-400" />,
    facebook: <FaFacebook className="text-blue-600" />,
    instagram: <FaInstagram className="text-pink-600" />,
  };

  return (
    <div className="flex gap-2 justify-center md:justify-start">
      {platforms.map((p) => {
        const key = p.toLowerCase();
        return (
          <span key={key} title={p} className="p-1 rounded-full bg-gray-100">
            {PLATFORM_ICONS[key] || <FaHashtag className="text-gray-500" />}
          </span>
        );
      })}
    </div>
  );
};

// --- MOCK/PLACEHOLDER DATA FOR STATS (Using undefined values for testing) ---
interface Stats {
  total: number;
  scheduled: number;
  posted: number; // Ensure this is 'published', matching the server fix
  draft: number; // Ensure this is included
  failed: number; // Ensure this is included
  platforms: { [key: string]: number };
}

// Initial state set to match the structure, but with nulls or zeros to prevent errors
const INITIAL_STATS: Stats = {
  total: 0,
  scheduled: 0,
  posted: 0,
  draft: 0, // Added draft/failed for completeness
  failed: 0,
  platforms: {},
};

const BASE_URL =
  "https://social-media-content-scheduler-production.up.railway.app/api"; // Moved outside component or use context

// --------------------------------------------------------------------------

export function Dashboard() {
  const [upcoming, setUpcoming] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); // Changed initial state to true
  const [error, setError] = useState("");

  // 1. Fetch Upcoming Posts
  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(""); // Clear error for this fetch
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated. Please log in.");

      const res = await fetch(`${BASE_URL}/dashboard/upcoming`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch upcoming posts.");
      }

      const data = await res.json();
      const postsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.upcoming)
        ? data.upcoming
        : [];
      setUpcoming(postsArray);
    } catch (err: any) {
      // Prioritize the stats error if it's the only one
      setError((prev) => prev || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated. Please log in.");

      const res = await fetch(`${BASE_URL}/posts/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch statistics.");
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError((prev) => prev || err.message); // Set error if not already set
      setStats(INITIAL_STATS); // Reset to safe initial state on failure
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
    fetchStats();
  }, [fetchUpcoming, fetchStats]);

  // Helper for status colors
  const STATUS_COLORS: { [key: string]: string } = {
    scheduled: "text-yellow-600 bg-yellow-100",
    published: "text-green-600 bg-green-100",
    draft: "text-gray-600 bg-gray-100",
    failed: "text-red-600 bg-red-100",
  };

  // UI Component for the Statistics Cards
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    loading,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    loading: boolean;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between transition duration-300 hover:shadow-xl">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          // FIX: Use optional chaining or a simple check to ensure value is a number
          <p className={`text-4xl font-bold mt-1 ${color}`}>
            {/* Ensure value is not null/undefined before calling toLocaleString */}
            {typeof value === "number" ? value.toLocaleString() : "N/A"}
          </p>
        )}
      </div>
      <Icon className={`w-8 h-8 ${color} opacity-50`} />
    </div>
  );

  // UI Component for Platform Breakdown
  const PlatformBreakdown = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
      <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
        <FaHashtag className="mr-2 opacity-70" /> Posts by Platform
      </h3>
      {loadingStats ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
        </div>
      ) : (
        // FIX: Ensure stats.platforms is not undefined/null before accessing
        Object.entries(stats.platforms || {}).map(([platform, count]) => (
          <div
            key={platform}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <span className="text-gray-700 capitalize">{platform}</span>
            <span className="font-semibold text-teal-700">
              {typeof count === "number" ? count : 0}
            </span>
          </div>
        ))
      )}
      {/* If the object is empty after loading, display a message */}
      {!loadingStats && Object.keys(stats.platforms || {}).length === 0 && (
        <p className="text-sm text-gray-500">No platform data available.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-teal-800 mb-8">
        Welcome Back!
      </h1>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
          <p className="font-medium">Error Loading Data:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* --- SECTION 1: CORE STATISTICS (Card Layout) --- */}
      <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
        <FaChartLine className="mr-3 text-teal-600" /> Platform Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Stat Card 1: Total Posts */}
        <StatCard
          title="Total Posts"
          value={stats.total}
          icon={FaHashtag}
          color="text-teal-700"
          loading={loadingStats}
        />

        {/* Stat Card 2: Scheduled Posts (Highlighting future work) */}
        <StatCard
          title="Scheduled Posts"
          value={stats.scheduled}
          icon={FaClock}
          color="text-yellow-600" // Accent color
          loading={loadingStats}
        />

        {/* Stat Card 3: Published Posts (Highlighting success) */}
        <StatCard
          title="Published Posts"
          value={stats.posted}
          icon={FaCheckCircle}
          color="text-green-600"
          loading={loadingStats}
        />

        {/* Stat Card 4: Platform Breakdown (Takes 2 columns on medium screens) */}
        <PlatformBreakdown />
      </div>

      <hr className="my-8 border-gray-200" />

      {/* --- SECTION 2: UPCOMING SCHEDULE (List View) --- */}
      <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-teal-600" /> Upcoming Schedule (Next
        5)
      </h2>

      {loading && (
        <div className="p-4 rounded-xl bg-white shadow">
          {/* Using Skeleton Loader for Upcoming posts as well */}
          <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      )}

      {!loading && upcoming.length === 0 && !error && (
        <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-yellow-400">
          <p className="font-medium text-gray-600">
            You're all caught up! No posts are currently scheduled.
          </p>
        </div>
      )}

      {/* Upcoming Posts List/Table (Highly stylized and responsive) */}
      {upcoming.length > 0 && (
        <div className="space-y-4">
          {upcoming.map((post) => (
            <div
              key={post._id}
              className="bg-white overflow-hidden p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 hover:shadow-lg border-l-4 border-yellow-500"
            >
              {/* Content & Platforms */}
              <div className="mb-3 md:mb-0 md:w-3/5">
                <p className="font-semibold text-gray-800 line-clamp-2">
                  {post.content}
                </p>
                <div className="mt-2">
                  <PlatformBadges platforms={post.platforms} />
                </div>
              </div>

              {/* Schedule Time & Date */}
              <div className="md:w-auto text-right">
                <p className="text-sm font-medium text-gray-500">
                  Scheduled for:
                </p>
                <p className="text-lg font-bold text-teal-700">
                  {/* Ensure scheduleAt is valid before formatting */}
                  {new Date(post.scheduleAt).getTime() > 0
                    ? new Date(post.scheduleAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post.scheduleAt).getTime() > 0
                    ? new Date(post.scheduleAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Invalid Date"}
                </p>
              </div>

              {/* Status (Hidden on mobile for space, but available on desktop) */}
              <span
                className={`
                        hidden md:inline-block px-3 py-1 text-xs font-semibold rounded-full 
                        ${
                          STATUS_COLORS[post.status.toLowerCase()] ||
                          "text-gray-600 bg-gray-100"
                        }
                    `}
              >
                {post.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
