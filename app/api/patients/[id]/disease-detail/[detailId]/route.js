import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Patient from "@/lib/models/Patient";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { date, disease, medicine, note } = await request.json();
    if (!disease) {
      return NextResponse.json({ message: "Disease is required" }, { status: 400 });
    }

    await connectDB();
    const patient = await Patient.findById(params.id);
    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    if (patient.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "You don't have access to this patient" }, { status: 403 });
    }

    const detail = patient.diseaseDetails.id(params.detailId);
    if (!detail) return NextResponse.json({ message: "Detail not found" }, { status: 404 });

    detail.date = date || detail.date;
    detail.disease = disease;
    detail.medicine = medicine;
    detail.note = note;
    await patient.save();

    return NextResponse.json({ message: "Disease detail updated", patient });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update disease detail", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
    const patient = await Patient.findById(params.id);
    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    if (patient.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "You don't have access to this patient" }, { status: 403 });
    }

    patient.diseaseDetails = patient.diseaseDetails.filter(
      (d) => d._id.toString() !== params.detailId
    );
    await patient.save();

    return NextResponse.json({ message: "Disease detail removed", patient });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to remove disease detail", error: err.message },
      { status: 500 }
    );
  }
}
