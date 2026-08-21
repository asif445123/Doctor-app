import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Patient from "@/lib/models/Patient";
import { getAuthUser } from "@/lib/auth";

async function loadOwnedPatient(id, userId) {
  const patient = await Patient.findById(id);
  if (!patient) return { error: NextResponse.json({ message: "Patient not found" }, { status: 404 }) };
  if (patient.createdBy.toString() !== userId.toString()) {
    return { error: NextResponse.json({ message: "You don't have access to this patient" }, { status: 403 }) };
  }
  return { patient };
}

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
    const { error, patient } = await loadOwnedPatient(params.id, user._id);
    if (error) return error;

    const { date, patientName, age, houseAddress, disease, medicine, note, amount } =
      await request.json();

    Object.assign(patient, { date, patientName, age, houseAddress, disease, medicine, note, amount });
    await patient.save();

    return NextResponse.json({ message: "Patient updated", patient });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update patient", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
    const { error, patient } = await loadOwnedPatient(params.id, user._id);
    if (error) return error;

    await patient.deleteOne();

    // Renumber the user's remaining patients so Sr. No stays gap-free (1, 2, 3, ...)
    // in the same order they were originally added.
    const remaining = await Patient.find({ createdBy: user._id }).sort({ createdAt: 1 });
    const bulkOps = remaining.map((p, idx) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { srNo: idx + 1 },
      },
    }));
    if (bulkOps.length) {
      await Patient.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: "Patient removed" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete patient", error: err.message },
      { status: 500 }
    );
  }
}
