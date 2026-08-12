"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaCog, FaSignOutAlt, FaCheckCircle, FaEnvelope, FaPlus } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import ContactModal from "@/components/ContactModal";

export default function Navbar() {
  const { user, logout, isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = isDemo
    ? "DE"
    : user
    ? user.name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const displayName = isDemo ? "Demo User" : user?.name || "";

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will need to log in again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "#1d4ed8",
    });
    if (confirm.isConfirmed) {
      await logout();
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <Link href="/dashboard" className="text-lg font-semibold text-brand-700">
        🩺 Doctor App
      </Link>

      <div className="hidden items-center gap-5 sm:flex">
        {!isDemo && user && (
          <Link
            href="/dashboard?add=1"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
          >
            <FaPlus size={12} /> Add Patient
          </Link>
        )}
        {!isDemo && user?.role === "admin" && (
          <Link
            href="/admin/approvals"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
          >
            <FaCheckCircle size={13} /> User approvals
          </Link>
        )}
        <button
          onClick={() => setContactOpen(true)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
        >
          <FaEnvelope size={13} /> Contact Us
        </button>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-slate-700 sm:inline">
            {displayName}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-lg">
            {isDemo ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Demo mode — settings disabled.
              </div>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <FaCog size={14} /> Settings
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>
        )}
      </div>

      {contactOpen && (
        <ContactModal
          onClose={() => setContactOpen(false)}
          defaultName={isDemo ? "" : user?.name || ""}
          defaultEmail={isDemo ? "" : user?.email || ""}
        />
      )}
    </header>
  );
}
