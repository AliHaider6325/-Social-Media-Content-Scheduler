// src/pages/AnalyticsPage.tsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  scheduled: number;
  posted: number;
  draft: number;
  failed: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("http://localhost:5000/api/posts/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load stats");
      }

      const data: Stats = await res.json();
      // Defensive defaults in case backend omits keys
      setStats({
        scheduled: data.scheduled ?? 0,
        posted: data.posted ?? 0,
        draft: data.draft ?? 0,
        failed: data.failed ?? 0,
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError(err.message || "Failed to fetch stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats
    ? [
        { name: "Scheduled", value: stats.scheduled },
        { name: "Posted", value: stats.posted },
        { name: "Draft", value: stats.draft },
        { name: "Failed", value: stats.failed },
      ]
    : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {loading && <p>Loading analytics...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && stats && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white shadow p-4 rounded-xl text-center">
              <h3 className="text-lg font-semibold">Scheduled</h3>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </div>

            <div className="bg-white shadow p-4 rounded-xl text-center">
              <h3 className="text-lg font-semibold">Posted</h3>
              <p className="text-2xl font-bold">{stats.posted}</p>
            </div>

            <div className="bg-white shadow p-4 rounded-xl text-center">
              <h3 className="text-lg font-semibold">Draft</h3>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>

            <div className="bg-white shadow p-4 rounded-xl text-center">
              <h3 className="text-lg font-semibold">Failed</h3>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>

          {/* Responsive Bar Chart */}
          <div className="bg-white shadow p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Posts by status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!loading && !stats && !error && <p>No analytics available.</p>}
    </div>
  );
}
