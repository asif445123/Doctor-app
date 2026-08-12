"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import PasswordInput from "@/components/PasswordInput";

export default function SettingsPage() {
  const { user, isDemo, loading, refresh } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(isDemo ? "/dashboard" : "/login");
  }, [loading, user, isDemo, router]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/users/profile", profile);
      await refresh();
      Swal.fire({ icon: "success", title: "Profile updated", timer: 1400, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message || "Update failed", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      Swal.fire("Mismatch", "New passwords do not match", "warning");
      return;
    }
    setSavingPwd(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      Swal.fire({ icon: "success", title: "Password changed", timer: 1400, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", err.message || "Update failed", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold">Account Settings</h1>

        <form onSubmit={handleProfileSubmit} className="card space-y-4">
          <h2 className="font-medium">Profile</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              className="input"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Phone</label>
            <input
              className="input"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form onSubmit={handlePwdSubmit} className="card space-y-4">
          <h2 className="font-medium">Change Password</h2>
          <PasswordInput
            placeholder="Current password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
            required
          />
          <PasswordInput
            placeholder="New password"
            value={pwd.newPassword}
            onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
            required
            minLength={6}
          />
          <PasswordInput
            placeholder="Confirm new password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            required
            minLength={6}
          />
          <button type="submit" disabled={savingPwd} className="btn-primary">
            {savingPwd ? "Saving..." : "Change Password"}
          </button>
        </form>
      </main>
    </div>
  );
}
