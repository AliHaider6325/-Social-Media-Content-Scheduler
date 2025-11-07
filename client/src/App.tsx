import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreatePost from "./pages/CreatePost";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // simple check

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/posts"
        element={isAuthenticated ? <Posts /> : <Navigate to="/login" />}
      />
      <Route
        path="/create"
        element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
