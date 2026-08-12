import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { name, email, phone } = await request.json();
    await connectDB();

    if (email && email.toLowerCase() !== authUser.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 400 });
      authUser.email = email.toLowerCase();
    }
    if (name) authUser.name = name;
    if (phone !== undefined) authUser.phone = phone;

    await authUser.save();
    return NextResponse.json({ message: "Profile updated", user: authUser.toSafeJSON() });
  } catch (err) {
    return NextResponse.json({ message: "Update failed", error: err.message }, { status: 500 });
  }
}
