// src/pages/auth/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from "react-icons/fa";

// Dynamically pick backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const authContext = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("API_URL used:", API_URL); // sanity check

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Login failed. Check credentials.");
      }

      const data = await res.json();

      // Save token in context & localStorage
      authContext.setToken(data.token);
      localStorage.setItem("token", data.token);

      navigate("/"); // redirect to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <FaSignInAlt className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-teal-800">
            Sign In to Scheduler
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your content scheduling dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold shadow-md transition duration-300 flex items-center justify-center gap-2 ${
              loading
                ? "bg-teal-400 text-teal-900 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?
            <Link
              to="/register"
              className="font-medium text-teal-600 hover:text-teal-500 ml-1"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
