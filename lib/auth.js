import jwt from "jsonwebtoken";
import { connectDB } from "./db";
import User from "./models/User";

export async function getAuthUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user || user.status !== "approved") return null;
    return user;
  } catch {
    return null;
  }
}

export function signToken(id, remember) {
  const expiresIn = remember
    ? process.env.JWT_REMEMBER_EXPIRES_IN || "30d"
    : process.env.JWT_EXPIRES_IN || "1d";
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
}

export function authCookieOptions(remember) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: (remember ? 30 : 1) * 24 * 60 * 60,
    path: "/",
  };
}
