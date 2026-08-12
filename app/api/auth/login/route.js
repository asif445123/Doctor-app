import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken, authCookieOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password, remember } = await request.json();

    await connectDB();
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    if (user.status !== "approved") {
      return NextResponse.json(
        {
          message:
            user.status === "pending"
              ? "Your account is pending admin approval."
              : "Your account request was rejected. Contact admin.",
          status: user.status,
        },
        { status: 403 }
      );
    }

    const token = signToken(user._id, !!remember);

    const res = NextResponse.json({ message: "Login successful", user: user.toSafeJSON() });
    res.cookies.set("token", token, authCookieOptions(!!remember));
    return res;
  } catch (err) {
    return NextResponse.json({ message: "Login failed", error: err.message }, { status: 500 });
  }
}
