"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

export default function ContactModal({ onClose, defaultName = "", defaultEmail = "" }) {
  const [form, setForm] = useState({ name: defaultName, email: defaultEmail, message: "" });
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      Swal.fire({
        icon: "success",
        title: "Message sent",
        text: "We'll get back to you soon.",
        timer: 1800,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold leading-snug">
            We&apos;d love to hear from you. Send us a message!
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="Enter your full name"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email address"
              value={form.email}
              onChange={set("email")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input min-h-[110px] resize-y"
              placeholder="Type your message here..."
              value={form.message}
              onChange={set("message")}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="btn-primary">
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
