// Dashboard.tsx
import { useState, useEffect } from "react";

interface Post {
  _id: string;
  content: string;
  platforms: string[];
  scheduleAt: string;
  status: string;
}

export function Dashboard() {
  const [upcoming, setUpcoming] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    setLoading(true);
    setError("");
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated. Please log in.");

      const res = await fetch("http://localhost:5000/api/dashboard/upcoming", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass JWT
        },
      });

      if (!res.ok) {
        // Try to parse error from backend
        let errMsg = "Failed to fetch upcoming posts";
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      // Handle if backend wraps posts in an object
      const postsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.upcoming)
        ? data.upcoming
        : [];
      setUpcoming(postsArray);
      console.log("Fetched upcoming posts:", postsArray); // Debug
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Posts</h2>

      {loading && <p>Loading upcoming posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && upcoming.length === 0 && !error && (
        <p>No upcoming posts found.</p>
      )}

      {upcoming.length > 0 && (
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Content</th>
              <th className="border border-gray-300 px-4 py-2">Platforms</th>
              <th className="border border-gray-300 px-4 py-2">Scheduled At</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((post) => (
              <tr key={post._id}>
                <td>{post.content}</td>
                <td>
                  {Array.isArray(post.platforms)
                    ? post.platforms.join(", ")
                    : "Instagram"}
                </td>
                <td>{new Date(post.scheduleAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
