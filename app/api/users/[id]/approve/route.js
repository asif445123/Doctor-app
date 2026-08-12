import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request, { params }) {
  const admin = await getAuthUser(request);
  if (!admin) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin")
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });

  await connectDB();
  const user = await User.findByIdAndUpdate(params.id, { status: "approved" }, { new: true });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json({ message: "User approved", user: user.toSafeJSON() });
}
