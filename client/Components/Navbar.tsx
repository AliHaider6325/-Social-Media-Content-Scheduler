import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-10 bg-teal-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold tracking-wider text-teal-100 hover:text-white transition duration-300"
          >
            <span role="img" aria-label="schedule">
              🗓️
            </span>{" "}
            Scheduler Pro
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-teal-200 hover:text-white transition duration-300 px-3 py-2 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/posts"
              className="text-teal-200 hover:text-white transition duration-300 px-3 py-2 rounded-lg"
            >
              Posts
            </Link>
            <Link
              to="/analytics"
              className="text-teal-200 hover:text-white transition duration-300 px-3 py-2 rounded-lg"
            >
              Analytics
            </Link>

            {/* Primary Action Button (Desktop) */}
            <Link
              to="/posts/create"
              className="
                bg-yellow-400 text-teal-900 font-semibold 
                px-4 py-2 rounded-full shadow-md 
                hover:bg-yellow-300 transition duration-300 ease-in-out
                transform hover:scale-105
              "
            >
              + Create Post
            </Link>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              className="
                bg-red-600 text-white font-medium 
                px-4 py-2 rounded-lg 
                hover:bg-red-700 transition duration-300
              "
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button (Hamburger) - Visible on small screens */}
          <button
            className="md:hidden text-teal-100 p-2 rounded-md hover:bg-teal-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {/* Using a simple SVG for the Hamburger/Close icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Content - Toggles visibility based on state */}
        <div
          id="mobile-menu"
          className={`md:hidden ${isOpen ? "block" : "hidden"} mt-2 space-y-2`}
        >
          {/* Navigation Links (Mobile) */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-teal-200 hover:bg-teal-700 p-3 rounded-lg transition duration-300"
          >
            Dashboard
          </Link>
          <Link
            to="/posts"
            onClick={() => setIsOpen(false)}
            className="block text-teal-200 hover:bg-teal-700 p-3 rounded-lg transition duration-300"
          >
            Posts
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsOpen(false)}
            className="block text-teal-200 hover:bg-teal-700 p-3 rounded-lg transition duration-300"
          >
            Analytics
          </Link>

          {/* Primary Action Button (Mobile) */}
          <Link
            to="/posts/create"
            onClick={() => setIsOpen(false)}
            className="
              block text-center 
              bg-yellow-400 text-teal-900 font-semibold 
              px-4 py-3 rounded-lg shadow-md mt-4 
              hover:bg-yellow-300 transition duration-300
            "
          >
            + Create Post
          </Link>

          {/* Logout Button (Mobile) */}
          <button
            onClick={handleLogout}
            className="
              w-full text-center 
              bg-red-600 text-white font-medium 
              px-4 py-3 rounded-lg mt-2 
              hover:bg-red-700 transition duration-300
            "
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
