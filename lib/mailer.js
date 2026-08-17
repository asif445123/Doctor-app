// Render blocks outbound SMTP connections on its free/starter tiers (a spam-prevention
// measure), which is why nodemailer times out no matter what settings are used. Sending
// mail over Resend's HTTPS API instead sidesteps that entirely — it's a normal web request.
export async function sendEmail({ to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Doctor App <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Resend API error (${res.status})`);
  }
}
