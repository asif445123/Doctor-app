"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import AutocompleteInput from "./AutocompleteInput";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  patientName: "",
  age: "",
  houseAddress: "",
  disease: "",
  medicine: "",
  note: "",
  amount: "",
};

export default function PatientModal({ patient, onClose, onSaved, isDemo }) {
  const [form, setForm] = useState(emptyForm);
  const [extraDetails, setExtraDetails] = useState([]); // new disease details added in this session
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        date: patient.date?.slice(0, 10) || emptyForm.date,
        patientName: patient.patientName || "",
        age: patient.age || "",
        houseAddress: patient.houseAddress || "",
        disease: patient.disease || "",
        medicine: patient.medicine || "",
        note: patient.note || "",
        amount: patient.amount || "",
      });
    } else {
      setForm(emptyForm);
    }
    setExtraDetails([]);
  }, [patient]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const addDetailRow = () => {
    setExtraDetails((d) => [
      ...d,
      { disease: "", medicine: "", note: "", date: new Date().toISOString().slice(0, 10) },
    ]);
  };

  const updateDetailRow = (idx, key, val) => {
    setExtraDetails((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r))
    );
  };

  const removeDetailRow = (idx) => {
    setExtraDetails((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDemo) {
      Swal.fire("Demo mode", "Saving is disabled in demo mode.", "info");
      return;
    }

    const missing = [];
    if (!form.date) missing.push("Date");
    if (!form.age) missing.push("Age");
    if (!form.patientName.trim()) missing.push("Patient Name");
    if (!form.disease.trim()) missing.push("Disease");

    if (missing.length) {
      Swal.fire({
        icon: "warning",
        title: "Missing required fields",
        html: `Please fill in: <b>${missing.join(", ")}</b>`,
      });
      return;
    }

    const incompleteRow = extraDetails.find(
      (row) => (row.medicine || row.note) && !row.disease.trim()
    );
    if (incompleteRow) {
      Swal.fire({
        icon: "warning",
        title: "Missing disease",
        text: "Please fill in the Disease field for every extra detail row you've started, or remove the row.",
      });
      return;
    }

    setSaving(true);
    try {
      let saved;
      if (patient) {
        const data = await api.put(`/patients/${patient._id}`, form);
        saved = data.patient;
      } else {
        const data = await api.post("/patients", form);
        saved = data.patient;
      }

      for (const row of extraDetails) {
        if (row.disease) {
          await api.post(`/patients/${saved._id}/disease-detail`, row);
        }
      }

      Swal.fire({
        icon: "success",
        title: patient ? "Patient updated" : "Patient added",
        timer: 1400,
        showConfirmButton: false,
      });

      onSaved();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {patient ? "Edit Patient" : "Add Patient"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => set("date")(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Age</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.age}
                onChange={(e) => set("age")(e.target.value)}
                required
              />
            </div>
          </div>

          <AutocompleteInput
            label="Patient Name"
            field="patientName"
            value={form.patientName}
            onChange={set("patientName")}
            required
          />

          <AutocompleteInput
            label="House Address"
            field="houseAddress"
            value={form.houseAddress}
            onChange={set("houseAddress")}
          />

          <div className="grid grid-cols-2 gap-4">
            <AutocompleteInput
              label="Disease"
              field="disease"
              value={form.disease}
              onChange={set("disease")}
              required
              multiValue
            />
            <AutocompleteInput
              label="Medicine"
              field="medicine"
              value={form.medicine}
              onChange={set("medicine")}
              multiValue
            />
          </div>

          <AutocompleteInput
            label="Note"
            field="note"
            value={form.note}
            onChange={set("note")}
            multiValue
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Amount</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.amount}
              onChange={(e) => set("amount")(e.target.value)}
            />
          </div>

          {/* Existing disease details, read-only reference */}
          {patient?.diseaseDetails?.length > 0 && (
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">Previous visit details</p>
              <ul className="space-y-1 text-sm">
                {patient.diseaseDetails.map((d) => (
                  <li key={d._id} className="text-slate-600">
                    • {d.date?.slice(0, 10)} — {d.disease}
                    {d.medicine ? ` (${d.medicine})` : ""}
                    {d.note ? `: ${d.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add more disease detail entries */}
          <div className="rounded-lg border border-dashed border-slate-300 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Add more disease detail</p>
              <button
                type="button"
                onClick={addDetailRow}
                className="btn-secondary !px-3 !py-1 text-xs"
              >
                + Add detail
              </button>
            </div>

            {extraDetails.map((row, idx) => (
              <div key={idx} className="mb-3 grid grid-cols-12 gap-2 rounded-lg bg-slate-50 p-2">
                <input
                  type="date"
                  className="input col-span-3"
                  value={row.date}
                  onChange={(e) => updateDetailRow(idx, "date", e.target.value)}
                />
                <div className="col-span-3">
                  <AutocompleteInput
                    field="disease"
                    value={row.disease}
                    onChange={(val) => updateDetailRow(idx, "disease", val)}
                    multiValue
                  />
                </div>
                <div className="col-span-3">
                  <AutocompleteInput
                    field="medicine"
                    value={row.medicine}
                    onChange={(val) => updateDetailRow(idx, "medicine", val)}
                    multiValue
                  />
                </div>
                <div className="col-span-2">
                  <AutocompleteInput
                    field="note"
                    value={row.note}
                    onChange={(val) => updateDetailRow(idx, "note", val)}
                    multiValue
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDetailRow(idx)}
                  className="col-span-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
