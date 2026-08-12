"use client";

import { FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_URL } from "@/lib/contact";

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:scale-105"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
