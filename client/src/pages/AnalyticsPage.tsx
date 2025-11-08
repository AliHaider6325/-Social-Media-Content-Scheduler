// src/pages/AnalyticsPage.tsx - Corrected Bar Chart Rendering
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FaChartBar, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

interface Stats {
  Twitter: number;
  Facebook: number;
  Instagram: number;
}

// Define Status Colors and Icons for consistency across the app
const STATUS_VISUALS = {
  scheduled: {
    color: "#FFCA28",
    icon: FaTwitter,
    label: "Twitter",
    textColor: "text-white",
    bg: "bg-blue-400",
  },
  published: {
    color: "#2E7D32",
    icon: FaFacebook,
    label: "Facebook",
    textColor: "text-green-700",
    bg: "bg-green-100",
  },
  draft: {
    color: "2E7D32",
    icon: FaInstagram,
    label: "Instagram",
    textColor: "text-red-400",
    bg: "bg-red-100",
  },
};

// Map keys to colors for the chart fill function
const KEY_TO_COLOR: { [key: string]: string } = {
  Twitter: STATUS_VISUALS.scheduled.color,
  Instagram: STATUS_VISUALS.published.color,
  Facebook: STATUS_VISUALS.draft.color,
};

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Look up the key based on the name (label)
    const key = payload[0].payload.key;
    const visual = KEY_TO_COLOR[key]
      ? STATUS_VISUALS[key as keyof typeof STATUS_VISUALS]
      : null;

    if (!visual) return null;

    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-500">
          {visual.label} Posts
        </p>
        <p className={`text-xl font-bold ${visual.textColor}`}>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    // ... (fetchStats implementation remains the same)
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("http://localhost:5000/api/posts/platforms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load stats");
      }

      const data: Stats = await res.json();
      setStats({
        Facebook: data.Facebook ?? 0,
        Instagram: data.Instagram ?? 0,
        Twitter: data.Twitter ?? 0,
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError(err.message || "Failed to fetch stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Memoized data preparation for the chart
  const chartData = useMemo(() => {
    if (!stats) return [];
    // Ensure the array structure includes the 'key' for color lookup
    return [
      { name: "Twitter", value: stats.Twitter, key: "scheduled" },
      { name: "Facebook", value: stats.Facebook, key: "draft" },
      { name: "Instagram", value: stats.Instagram, key: "published" },
    ];
  }, [stats]);

  // Helper component for the Stat Cards (omitted for brevity, assume it's correct)
  const StatCard = ({
    title,
    value,
    color,
    Icon,
    bg,
  }: {
    title: string;
    value: number;
    color: string;
    Icon: any;
    bg: string;
  }) => (
    <div
      className={`flex items-center justify-between p-5 rounded-xl shadow-lg border-b-4 ${color.replace(
        "text",
        "border"
      )} ${bg}`}
    >
      <div>
        <h3 className="text-sm font-medium text-gray-600 uppercase">{title}</h3>
        <p className={`text-3xl font-extrabold mt-1 ${color}`}>
          {value.toLocaleString()}
        </p>
      </div>
      <Icon className={`w-8 h-8 ${color} opacity-40`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-teal-800 mb-8 flex items-center">
        <FaChartBar className="mr-3 text-teal-600" /> Analytics Overview
      </h1>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white p-5 rounded-xl shadow-lg animate-pulse"
            ></div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
          <p className="font-medium">Error Loading Analytics:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* --- SECTION 1: CORE STATS CARDS (using StatCard component) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Scheduled */}
            <StatCard
              title={STATUS_VISUALS.scheduled.label}
              value={stats.Twitter}
              Icon={STATUS_VISUALS.scheduled.icon}
              color={STATUS_VISUALS.scheduled.textColor}
              bg={STATUS_VISUALS.scheduled.bg}
            />
            <StatCard
              title={STATUS_VISUALS.published.label}
              value={stats.Facebook}
              Icon={STATUS_VISUALS.published.icon}
              color={STATUS_VISUALS.published.textColor}
              bg={STATUS_VISUALS.published.bg}
            />
            <StatCard
              title={STATUS_VISUALS.draft.label}
              value={stats.Instagram}
              Icon={STATUS_VISUALS.draft.icon}
              color={STATUS_VISUALS.draft.textColor}
              bg={STATUS_VISUALS.draft.bg}
            />
          </div>

          {/* --- SECTION 2: STATUS DISTRIBUTION CHART (Fix applied here) --- */}
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center">
              Post Status Distribution
            </h3>
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData} // Pass complete data here
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e0e0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#555"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#555"
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: STATUS_VISUALS.scheduled.color,
                      opacity: 0.1,
                    }}
                  />

                  <Bar
                    dataKey="value"
                    name="Status Count"
                    fill="#005F5A"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!loading && !stats && !error && (
        <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-teal-400">
          <p className="font-medium text-gray-600">
            No post statistics available yet. Start scheduling your first post!
          </p>
        </div>
      )}
    </div>
  );
}
