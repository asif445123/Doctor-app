"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { demoPatients } from "@/lib/fakeData";
import Navbar from "@/components/Navbar";
import PatientTable from "@/components/PatientTable";
import PatientModal from "@/components/PatientModal";
import PatientDetailModal from "@/components/PatientDetailModal";

function DashboardContent() {
  const { user, isDemo, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isDemo) {
      router.replace("/login");
    }
  }, [loading, user, isDemo, router]);

  // Opens the Add Patient modal automatically when reached via /dashboard?add=1
  // (the navbar's "Add Patient" quick link).
  useEffect(() => {
    if (searchParams.get("add") === "1" && !isDemo && user) {
      setEditing(null);
      setModalOpen(true);
      router.replace("/dashboard");
    }
  }, [searchParams, isDemo, user, router]);

  const fetchPatients = useCallback(async () => {
    if (isDemo) {
      const q = search.toLowerCase();
      setPatients(
        q
          ? demoPatients.filter(
              (p) =>
                p.patientName.toLowerCase().includes(q) ||
                p.disease.toLowerCase().includes(q) ||
                p.medicine.toLowerCase().includes(q) ||
                p.houseAddress.toLowerCase().includes(q)
            )
          : demoPatients
      );
      return;
    }
    if (!user) return;
    setBusy(true);
    try {
      const data = await api.get(`/patients${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      setPatients(data.patients);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load patients", "error");
    } finally {
      setBusy(false);
    }
  }, [search, isDemo, user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (patient) => {
    if (isDemo) {
      Swal.fire("Demo mode", "Deleting is disabled in demo mode.", "info");
      return;
    }
    const confirm = await Swal.fire({
      title: `Remove ${patient.patientName}?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.del(`/patients/${patient._id}`);
      Swal.fire({ icon: "success", title: "Removed", timer: 1200, showConfirmButton: false });
      fetchPatients();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to remove patient", "error");
    }
  };

  if (loading) return null;

  return (
    <div>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isDemo && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 border border-amber-200">
            You&apos;re viewing demo data. Sign up or log in with an approved account to manage real patients.
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">My Patient Records</h1>
          <div className="flex gap-2">
            <input
              className="input sm:w-72"
              placeholder="Search patient, disease, medicine, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="btn-primary whitespace-nowrap"
              disabled={isDemo}
            >
              + Add Patient
            </button>
          </div>
        </div>

        {busy ? (
          <div className="card text-center text-sm text-slate-500">Loading...</div>
        ) : (
          <PatientTable
            patients={patients}
            isDemo={isDemo}
            onRowClick={(p) => setViewing(p)}
            onEdit={(p) => {
              if (isDemo) {
                Swal.fire("Demo mode", "Editing is disabled in demo mode.", "info");
                return;
              }
              setEditing(p);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </main>

      {modalOpen && (
        <PatientModal
          patient={editing}
          isDemo={isDemo}
          onClose={() => setModalOpen(false)}
          onSaved={fetchPatients}
        />
      )}

      {viewing && (
        <PatientDetailModal
          patient={viewing}
          isDemo={isDemo}
          onClose={() => setViewing(null)}
          onUpdated={(updatedPatient) => {
            setViewing(updatedPatient);
            setPatients((list) =>
              list.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
            );
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
