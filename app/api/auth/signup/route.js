import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Signup successful. Your account is pending admin approval.",
        user: user.toSafeJSON(),
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Signup failed", error: err.message }, { status: 500 });
  }
}
