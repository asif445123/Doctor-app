import mongoose from "mongoose";

const diseaseDetailSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    disease: { type: String, trim: true },
    medicine: { type: String, trim: true },
    note: { type: String, trim: true, default: "" },
  },
  { _id: true, timestamps: false }
);

const patientSchema = new mongoose.Schema(
  {
    srNo: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    patientName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    houseAddress: { type: String, trim: true, default: "" },
    disease: { type: String, trim: true, required: true },
    medicine: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    amount: { type: Number, default: 0 },
    diseaseDetails: [diseaseDetailSchema],
    // Every patient belongs to exactly one user account — records are never shared between users.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

patientSchema.index({
  patientName: "text",
  disease: "text",
  medicine: "text",
  houseAddress: "text",
});

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
