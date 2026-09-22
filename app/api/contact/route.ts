import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html';

export async function POST(req: NextRequest) {
  try {
    // Constructed per-request: the Resend client throws on a missing key, and
    // at module scope that turns a missing build-time env var into a failed
    // deploy rather than a runtime error.
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'Kineticube Contact Form <noreply@kineticube.shop>',
      to: 'support@kineticube.shop',
      replyTo: email,
      subject: subject ? `[Contact] ${subject}` : `[Contact] Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '(none)'}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #222;">
          <h2 style="color: #f05a1a; margin-bottom: 4px;">New Contact Form Submission</h2>
          <hr style="border-color: #eee; margin-bottom: 16px;" />
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Subject:</strong> ${escapeHtml(subject || '(none)')}</p>
          <hr style="border-color: #eee; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          <hr style="border-color: #eee; margin-top: 24px;" />
          <p style="color: #999; font-size: 12px;">Sent via kineticube.shop contact form. Hit reply to respond directly.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
