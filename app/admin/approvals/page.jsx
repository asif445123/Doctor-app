"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApprovalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    if (user.role !== "admin") return router.replace("/dashboard");
  }, [loading, user, router]);

  const fetchUsers = useCallback(async () => {
    setBusy(true);
    try {
      const data = await api.get("/users");
      setUsers(data.users);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load users", "error");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user, fetchUsers]);

  const act = async (id, action) => {
    try {
      await api.put(`/users/${id}/${action}`);
      Swal.fire({
        icon: "success",
        title: action === "approve" ? "User approved" : "User rejected",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", err.message || "Action failed", "error");
    }
  };

  if (loading || !user || user.role !== "admin") return null;

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-semibold">User Approvals</h1>

        {busy ? (
          <div className="card text-center text-sm text-slate-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">No users found.</div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs capitalize ${
                      statusStyles[u.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {u.status !== "approved" && (
                    <button
                      onClick={() => act(u.id, "approve")}
                      className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {u.status !== "rejected" && (
                    <button
                      onClick={() => act(u.id, "reject")}
                      className="btn-secondary !text-red-600"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
