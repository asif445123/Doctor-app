"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import ContactModal from "@/components/ContactModal";
import { WHATSAPP_URL } from "@/lib/contact";

export default function LoginPage() {
  const { login, enterDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, remember);
      router.push("/dashboard");
    } catch (err) {
      const status = err.data?.status;
      if (status === "pending" || status === "rejected") {
        const isPending = status === "pending";
        Swal.fire({
          width: 360,
          padding: "1.5rem",
          html: `
            <div style="display:flex;justify-content:center;margin-bottom:8px;">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="#fff"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="#ef4444" stroke-width="2"/>
              </svg>
            </div>
            <h2 style="margin:0 0 10px 0;font-size:20px;font-weight:700;color:#334155;">
              ${isPending ? "Approval Pending" : "Access Denied"}
            </h2>
            <p style="margin:0 0 16px 0;color:#475569;font-size:13.5px;line-height:1.4;">
              ${
                isPending
                  ? "Your account is pending admin approval. Please contact us for approval."
                  : "Your account was rejected by the admin. Please contact us for approval."
              }
            </p>
            <div style="display:flex; gap:12px; justify-content:center; margin-bottom:14px;">
              <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" title="WhatsApp"
                 style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:#25D366;text-decoration:none;">
                <svg viewBox="0 0 448 512" width="20" height="20" fill="#fff"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
              </a>
              <button id="openContactUsBtn" type="button" title="Contact Us"
                 style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:#2563eb;border:none;cursor:pointer;">
                <svg viewBox="0 0 512 512" width="18" height="18" fill="#fff"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
              </button>
            </div>
            <p style="font-size:13px;margin:0;">
              <a id="backToLoginLink" href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">← Back to Login</a>
              <span style="color:#94a3b8;"> Or </span>
              <a id="viewDemoLink" href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">View Demo</a>
            </p>
          `,
          showConfirmButton: false,
          showCancelButton: false,
          didOpen: (popup) => {
            popup.querySelector("#openContactUsBtn")?.addEventListener("click", () => {
              Swal.close();
              setContactOpen(true);
            });
            popup.querySelector("#backToLoginLink")?.addEventListener("click", (e) => {
              e.preventDefault();
              Swal.close();
            });
            popup.querySelector("#viewDemoLink")?.addEventListener("click", (e) => {
              e.preventDefault();
              Swal.close();
              enterDemo();
              router.push("/dashboard");
            });
          },
        });
      } else {
        Swal.fire("Login Failed", err.message || "Invalid credentials", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    enterDemo();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-700">🩺 Doctor App</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Sign in to manage patient records</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <button onClick={handleDemo} className="btn-secondary mt-3 w-full">
          👀 View Demo
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {contactOpen && (
        <ContactModal onClose={() => setContactOpen(false)} defaultEmail={email} />
      )}
    </div>
  );
}
