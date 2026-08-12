"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      Swal.fire("Mismatch", "Passwords do not match", "warning");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post(`/auth/reset-password/${token}`, { password });
      await Swal.fire("Success", data.message, "success");
      router.push("/login");
    } catch (err) {
      Swal.fire("Error", err.message || "Reset link invalid or expired", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-700">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <PasswordInput
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
