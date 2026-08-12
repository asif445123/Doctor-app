import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(request) {
  const admin = await getAuthUser(request);
  if (!admin) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin")
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 });

  return NextResponse.json({ users: users.map((u) => u.toSafeJSON()) });
}
