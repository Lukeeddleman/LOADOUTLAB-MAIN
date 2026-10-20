import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html';
import { contactFrom, supportTo } from '@/lib/email-config';
import { verifyContactToken } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
    }
    const { website, turnstileToken } = body;
    if (website !== undefined && typeof website !== 'string') {
      return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
    }
    if (website?.trim()) {
      // Quietly discard the spam without calling Cloudflare or sending an email.
      return NextResponse.json({ success: true });
    }
    if (typeof body.name !== 'string' || typeof body.email !== 'string' ||
        typeof body.message !== 'string' ||
        (body.subject !== undefined && typeof body.subject !== 'string')) {
      return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
    }
    const name = body.name.trim();
    const email = body.email.trim();
    const subject = (body.subject || '').trim();
    const message = body.message.trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (name.length > 120 || email.length > 254 || subject.length > 120 ||
        message.length > 10000 || /[\r\n]/.test(name + subject)) {
      return NextResponse.json({ error: 'Please check the length and format of your message.' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const verification = await verifyContactToken(turnstileToken);
    if (verification === 'invalid') {
      return NextResponse.json({ error: 'Please complete the spam verification and try again.' }, { status: 403 });
    }
    if (verification === 'unavailable') {
      return NextResponse.json({ error: 'Spam verification is temporarily unavailable. Please try again or email us directly.' }, { status: 503 });
    }

    // Construct only after validation; no email is attempted for rejected submissions.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: contactFrom(),
      to: supportTo(),
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
          <p style="color: #999; font-size: 12px;">Sent via loadoutlab.com contact form. Hit reply to respond directly.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('[contact] Email provider rejected the message.');
      return NextResponse.json({ error: 'Your message could not be sent. Please try again or email us directly.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    console.error('[contact] Contact submission failed.');
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
