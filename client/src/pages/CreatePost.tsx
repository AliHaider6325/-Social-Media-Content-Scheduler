import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduleAt, setScheduleAt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/posts", { content, platforms, scheduleAt, imageUrl });
      toast.success("Post created!");
      navigate("/posts");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error creating post");
    }
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="container">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          required
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={platforms.includes("Twitter")}
              onChange={() => togglePlatform("Twitter")}
            />
            Twitter
          </label>
          <label>
            <input
              type="checkbox"
              checked={platforms.includes("Facebook")}
              onChange={() => togglePlatform("Facebook")}
            />
            Facebook
          </label>
          <label>
            <input
              type="checkbox"
              checked={platforms.includes("Instagram")}
              onChange={() => togglePlatform("Instagram")}
            />
            Instagram
          </label>
        </div>
        <input
          type="datetime-local"
          value={scheduleAt}
          onChange={(e) => setScheduleAt(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
