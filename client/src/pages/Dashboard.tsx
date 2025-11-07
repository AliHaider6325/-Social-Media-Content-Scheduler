import { useEffect, useState } from "react";

interface Post {
  _id: string;
  content: string;
  platform: string[];
  scheduleAt: string;
  status: string;
}

export default function Dashboard() {
  const [upcoming, setUpcoming] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const token = localStorage.getItem("token"); // wherever you store JWT
        const res = await fetch(
          "http://localhost:5000/api/dashboard/upcoming",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // MUST send JWT
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setUpcoming(data);
        else if (Array.isArray(data.upcoming)) setUpcoming(data.upcoming);
        else setUpcoming([]);
      } catch (err) {
        console.error("Failed to fetch upcoming posts:", err);
      }
    }
    fetchUpcoming();
  }, []);

  return (
    <div>
      <h2>Upcoming Posts</h2>
      {upcoming.length === 0 ? (
        <p>No upcoming posts.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Platforms</th>
              <th>Schedule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((post) => (
              <tr key={post._id}>
                <td>{post.content}</td>
                <td>{post.platform?.join(", ") || "N/A"}</td>
                <td>{new Date(post.scheduleAt).toLocaleString()}</td>
                <td>{post.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
