import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

export default async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password"); // <-- change here
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // store entire user object here
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}
