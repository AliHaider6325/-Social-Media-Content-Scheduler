import { useEffect, useState } from "react";
import api from "../api/axios";

interface Post {
  _id: string;
  content: string;
  platforms: string[];
  scheduleAt: string;
  status: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (pageNumber = 1) => {
    try {
      const res = await api.get(`/posts?page=${pageNumber}&limit=10`);
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container">
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            {post.content} | {post.platforms.join(", ")} |{" "}
            {new Date(post.scheduleAt).toLocaleString()} | {post.status}
          </li>
        ))}
      </ul>
      <div>
        <button disabled={page <= 1} onClick={() => fetchPosts(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => fetchPosts(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
