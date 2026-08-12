import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    await connectDB();
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    // Always respond success so we don't leak which emails are registered
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset - Doctor App",
      html: `<p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, please ignore this email.</p>`,
    });

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to process request", error: err.message },
      { status: 500 }
    );
  }
}
