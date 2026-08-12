import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Patient from "@/lib/models/Patient";
import { getAuthUser } from "@/lib/auth";

const allowedFields = ["patientName", "houseAddress", "disease", "medicine", "note"];

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const q = searchParams.get("q");

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ message: "Invalid field" }, { status: 400 });
    }

    await connectDB();

    const regex = q ? new RegExp(q, "i") : /.*/;
    const values = await Patient.distinct(field, {
      createdBy: user._id,
      [field]: regex,
    });

    return NextResponse.json({ suggestions: values.slice(0, 10) });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch suggestions", error: err.message },
      { status: 500 }
    );
  }
}
