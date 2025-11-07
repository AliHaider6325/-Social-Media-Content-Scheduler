import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/posts" className="hover:underline">
          Posts
        </Link>
        <Link
          to="/posts/create"
          className=" px-3 py-1 rounded hover:bg-blue-600"
        >
          Create Post
        </Link>
        <Link to="/analytics" className="ml-4">
          Analytics
        </Link>
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
};
