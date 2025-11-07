import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PostsList } from "../Components/PostsList";
import { CreatePost } from "./pages/CreatePost";

import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../Components/Navbar";
import { ProtectedRoute } from "../Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Toaster position="top-right" />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/create"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/edit/:id"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
