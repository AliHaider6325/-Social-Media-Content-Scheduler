// Register.tsx - Enhanced UI/UX
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Assuming you have defined API_URL or hardcoding for demonstration
const API_URL =
  "https://social-media-content-scheduler-production.up.railway.app/api";

import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSpinner,
} from "react-icons/fa";

export const Register = () => {
  // Added 'name' state, commonly required for registration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Add basic validation for name
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Updated body to include name
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message || "Registration failed. Please check your inputs."
        );
      }

      setSuccess("Registration successful! Redirecting to login...");
      // Use a consistent login route path
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <FaUserPlus className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-teal-800">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Start scheduling your content today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Name Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="Full Name"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm Password"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold shadow-md transition duration-300 flex items-center justify-center gap-2 
                            ${
                              loading
                                ? "bg-teal-400 text-teal-900 cursor-not-allowed"
                                : "bg-teal-600 text-white hover:bg-teal-700"
                            }`}
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?
            <Link
              to="/login"
              className="font-medium text-teal-600 hover:text-teal-500 ml-1"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
