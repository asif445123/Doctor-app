import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await request.json();

    const match = await bcrypt.compare(currentPassword, authUser.password);
    if (!match)
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });

    authUser.password = await bcrypt.hash(newPassword, 10);
    await authUser.save();

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Update failed", error: err.message }, { status: 500 });
  }
}
