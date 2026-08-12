"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { api } from "@/lib/api";
import AutocompleteInput from "./AutocompleteInput";

export default function PatientDetailModal({ patient, onClose, onUpdated, isDemo }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    disease: "",
    medicine: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVal = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleAdd = async (e) => {
    e.preventDefault();

    if (isDemo) {
      Swal.fire("Demo mode", "Adding details is disabled in demo mode.", "info");
      return;
    }
    if (!form.disease) {
      Swal.fire("Missing disease", "Please enter a disease.", "warning");
      return;
    }

    setSaving(true);
    try {
      const data = await api.post(`/patients/${patient._id}/disease-detail`, form);
      Swal.fire({ icon: "success", title: "Detail added", timer: 1200, showConfirmButton: false });
      setForm({ date: new Date().toISOString().slice(0, 10), disease: "", medicine: "", note: "" });
      onUpdated(data.patient);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to add detail", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (d) => {
    if (isDemo) {
      Swal.fire("Demo mode", "Editing is disabled in demo mode.", "info");
      return;
    }
    setEditingId(d._id);
    setEditForm({
      date: d.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      disease: d.disease || "",
      medicine: d.medicine || "",
      note: d.note || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (detailId) => {
    if (!editForm.disease) {
      Swal.fire("Missing disease", "Please enter a disease.", "warning");
      return;
    }
    setEditSaving(true);
    try {
      const data = await api.put(`/patients/${patient._id}/disease-detail/${detailId}`, editForm);
      Swal.fire({ icon: "success", title: "Detail updated", timer: 1200, showConfirmButton: false });
      onUpdated(data.patient);
      cancelEdit();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update detail", "error");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteDetail = async (detailId) => {
    if (isDemo) {
      Swal.fire("Demo mode", "Deleting is disabled in demo mode.", "info");
      return;
    }
    const confirm = await Swal.fire({
      title: "Remove this visit detail?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      const data = await api.del(`/patients/${patient._id}/disease-detail/${detailId}`);
      Swal.fire({ icon: "success", title: "Removed", timer: 1000, showConfirmButton: false });
      onUpdated(data.patient);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to remove detail", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{patient.patientName}</h2>
            <p className="text-xs text-slate-500">
              Sr. {patient.srNo} · Age {patient.age}
              {patient.houseAddress ? ` · ${patient.houseAddress}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 p-3">
          <p className="mb-1 text-xs font-semibold text-slate-500">Original visit</p>
          <p className="text-sm">
            {patient.date?.slice(0, 10)} — {patient.disease}
            {patient.medicine ? ` (${patient.medicine})` : ""}
            {patient.amount ? ` · Rs. ${patient.amount}` : ""}
          </p>
          {patient.note && <p className="mt-1 text-xs text-slate-500">{patient.note}</p>}
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">Visit history</p>
          {patient.diseaseDetails?.length ? (
            <ul className="space-y-2">
              {patient.diseaseDetails.map((d) =>
                editingId === d._id ? (
                  <li key={d._id} className="space-y-2 rounded-lg bg-slate-50 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="input"
                        value={editForm.date}
                        onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                      />
                      <AutocompleteInput
                        field="disease"
                        value={editForm.disease}
                        onChange={(val) => setEditForm((f) => ({ ...f, disease: val }))}
                        required
                        multiValue
                      />
                      <AutocompleteInput
                        field="medicine"
                        value={editForm.medicine}
                        onChange={(val) => setEditForm((f) => ({ ...f, medicine: val }))}
                        multiValue
                      />
                      <AutocompleteInput
                        field="note"
                        value={editForm.note}
                        onChange={(val) => setEditForm((f) => ({ ...f, note: val }))}
                        multiValue
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={cancelEdit} className="btn-secondary !px-3 !py-1 text-xs">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(d._id)}
                        disabled={editSaving}
                        className="btn-primary !px-3 !py-1 text-xs"
                      >
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={d._id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{d.date?.slice(0, 10)}</span> — {d.disease}
                      {d.medicine ? ` (${d.medicine})` : ""}
                      {d.note ? (
                        <span className="mt-0.5 block text-xs text-slate-500">{d.note}</span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 pt-0.5">
                      <button
                        onClick={() => startEdit(d)}
                        title="Edit"
                        className="text-brand-600 hover:text-brand-800"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteDetail(d._id)}
                        title="Remove"
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No additional visits recorded yet.</p>
          )}
        </div>

        <form
          onSubmit={handleAdd}
          className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3"
        >
          <p className="text-xs font-semibold text-slate-500">Add more disease detail</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="input" value={form.date} onChange={set("date")} />
            <AutocompleteInput
              field="disease"
              value={form.disease}
              onChange={setVal("disease")}
              required
              multiValue
            />
            <AutocompleteInput
              field="medicine"
              value={form.medicine}
              onChange={setVal("medicine")}
              multiValue
            />
            <AutocompleteInput
              field="note"
              value={form.note}
              onChange={setVal("note")}
              multiValue
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Adding..." : "+ Add Detail"}
          </button>
        </form>
      </div>
    </div>
  );
}
