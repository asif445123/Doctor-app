import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Patient from "@/lib/models/Patient";
import { getAuthUser } from "@/lib/auth";

// GET /api/patients?q=search — only this user's own patients
export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    await connectDB();

    let filter = { createdBy: user._id };
    if (q) {
      const regex = new RegExp(q, "i");
      filter = {
        createdBy: user._id,
        $or: [
          { patientName: regex },
          { disease: regex },
          { medicine: regex },
          { houseAddress: regex },
        ],
      };
    }

    const patients = await Patient.find(filter).sort({ srNo: -1 });
    return NextResponse.json({ patients });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch patients", error: err.message },
      { status: 500 }
    );
  }
}

// POST /api/patients — create a patient owned by this user
export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const { date, patientName, age, houseAddress, disease, medicine, note, amount } =
      await request.json();

    if (!patientName || !age || !disease) {
      return NextResponse.json(
        { message: "Patient name, age and disease are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Sr. number counts only this user's own records
    const last = await Patient.findOne({ createdBy: user._id }).sort({ srNo: -1 });
    const srNo = last ? last.srNo + 1 : 1;

    const patient = await Patient.create({
      srNo,
      date: date || Date.now(),
      patientName,
      age,
      houseAddress,
      disease,
      medicine,
      note,
      amount: amount || 0,
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Patient added", patient }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to add patient", error: err.message },
      { status: 500 }
    );
  }
}
