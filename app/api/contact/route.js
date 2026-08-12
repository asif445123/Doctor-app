import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { CONTACT_EMAIL } from "@/lib/contact";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email and message are required" },
        { status: 400 }
      );
    }

    await sendEmail({
      to: CONTACT_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to send message", error: err.message },
      { status: 500 }
    );
  }
}
