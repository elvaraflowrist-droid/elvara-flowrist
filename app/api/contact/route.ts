import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { contactInquiriesTable } from "@/db/schema";
import { sendContactInquiryEmail } from "@/lib/mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill in all fields" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // 1. Persist inquiry in PostgreSQL first so no submission is ever lost
    const [saved] = await db
      .insert(contactInquiriesTable)
      .values({ name, email, subject, message, emailSent: false })
      .returning({ id: contactInquiriesTable.id });

    // 2. Attempt email notification to elvaraflowrist@gmail.com
    let emailSent = false;
    try {
      emailSent = await sendContactInquiryEmail({ name, email, subject, message });
      if (emailSent && saved?.id) {
        await db
          .update(contactInquiriesTable)
          .set({ emailSent: true })
          .where(eq(contactInquiriesTable.id, saved.id));
      }
    } catch (mailError) {
      console.error("[Contact API] Email delivery failed (inquiry saved to DB):", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        message: "Your message has been received! Our florists will get back to you shortly.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Something went wrong while processing your request",
      },
      { status: 500 }
    );
  }
}
