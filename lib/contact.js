export const WHATSAPP_NUMBER = "923205501173";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const CONTACT_EMAIL = "masifrana445@gmail.com";

// Opens Gmail's web compose window instead of relying on a desktop mailto: handler,
// which is often not configured on Windows PCs and silently does nothing.
export function gmailComposeUrl(subject = "", body = "") {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT_EMAIL,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
