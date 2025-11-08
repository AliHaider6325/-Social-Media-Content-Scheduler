// import { useAuth } from "../context/AuthContext";

export const API_URL = "https://social-media-content-scheduler-production.up.railway.app/api";

export const fetchWithToken = async (endpoint: string, token: string | null, options: RequestInit = {}) => {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "API Error");
  }

  return res.json();
};
