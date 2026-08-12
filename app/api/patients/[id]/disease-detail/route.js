import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Patient from "@/lib/models/Patient";
import { getAuthUser } from "@/lib/auth";

export async function POST(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { disease, medicine, note, date } = await request.json();
    if (!disease) {
      return NextResponse.json({ message: "Disease is required" }, { status: 400 });
    }

    await connectDB();
    const patient = await Patient.findById(params.id);
    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    if (patient.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "You don't have access to this patient" }, { status: 403 });
    }

    patient.diseaseDetails.push({ disease, medicine, note, date: date || Date.now() });
    await patient.save();

    return NextResponse.json({ message: "Disease detail added", patient }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to add disease detail", error: err.message },
      { status: 500 }
    );
  }
}
