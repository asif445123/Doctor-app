import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  metadataBase: new URL("https://doctor-app-rflv.onrender.com"),
  title: {
    default: "Doctor App | Patient Record Management",
    template: "%s | Doctor App",
  },
  description:
    "Doctor App helps clinics and doctors manage patient records, diseases, medicines and visit history in one simple dashboard.",
  keywords: [
    "doctor app",
    "patient record",
    "clinic management",
    "patient management system",
    "medical records software",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doctor App",
  },
  openGraph: {
    title: "Doctor App | Patient Record Management",
    description:
      "Manage patient records, diseases, medicines and visit history in one simple dashboard.",
    type: "website",
    siteName: "Doctor App",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <FloatingWhatsApp />
          <AdBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
