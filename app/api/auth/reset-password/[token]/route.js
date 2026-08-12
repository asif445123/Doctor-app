import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request, { params }) {
  try {
    const { password } = await request.json();
    const hashedToken = crypto.createHash("sha256").update(params.token).digest("hex");

    await connectDB();
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to reset password", error: err.message },
      { status: 500 }
    );
  }
}
