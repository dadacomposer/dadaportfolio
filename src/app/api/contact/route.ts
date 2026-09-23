import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const recipient = 'dadacomposer@gmail.com';

type ContactSubmission = {
  identity: string;
  projectName: string;
  needs: string[];
  budget: string;
  email: string;
  phone: string;
  message: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const readSubmission = (body: unknown): ContactSubmission | null => {
  if (!body || typeof body !== 'object') return null;

  const data = body as Record<string, unknown>;
  if (
    typeof data.identity !== 'string' ||
    typeof data.projectName !== 'string' ||
    typeof data.budget !== 'string' ||
    typeof data.email !== 'string' ||
    !Array.isArray(data.needs) ||
    !data.needs.length ||
    !data.needs.every((need) => typeof need === 'string' && need.trim())
  ) {
    return null;
  }

  const email = data.email.trim();
  if (!data.identity.trim() || !data.projectName.trim() || !data.budget.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
    return null;
  }

  return {
    identity: data.identity.trim(),
    projectName: data.projectName.trim(),
    needs: (data.needs as string[]).map((need) => need.trim()),
    budget: data.budget.trim(),
    email,
    phone: typeof data.phone === 'string' ? data.phone.trim() : '',
    message: typeof data.message === 'string' ? data.message.trim() : '',
  };
};

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error('Resend is not configured. Missing RESEND_API_KEY or RESEND_FROM_EMAIL.');
    return NextResponse.json(
      { success: false, error: 'The contact form is temporarily unavailable.' },
      { status: 503 },
    );
  }

  try {
    const submission = readSubmission(await req.json());
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Please complete all required fields with a valid email address.' },
        { status: 400 },
      );
    }

    const resend = new Resend(apiKey);
    const { error: emailError } = await resend.emails.send({
      from,
      to: [recipient],
      replyTo: submission.email,
      subject: `New project request: ${submission.projectName.replace(/[\r\n]/g, ' ')}`,
      text: [
        'New DADA.COMPOSER contact request',
        '',
        `Name / role: ${submission.identity}`,
        `Project: ${submission.projectName}`,
        `Email: ${submission.email}`,
        `Phone: ${submission.phone || 'Not provided'}`,
        `Budget: ${submission.budget}`,
        `Services: ${submission.needs.join(', ')}`,
        '',
        `Message: ${submission.message || 'Not provided'}`,
      ].join('\n'),
      html: `
        <h1>New DADA.COMPOSER contact request</h1>
        <p><strong>Name / role:</strong> ${escapeHtml(submission.identity)}</p>
        <p><strong>Project:</strong> ${escapeHtml(submission.projectName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(submission.phone || 'Not provided')}</p>
        <p><strong>Budget:</strong> ${escapeHtml(submission.budget)}</p>
        <p><strong>Services:</strong> ${escapeHtml(submission.needs.join(', '))}</p>
        <p><strong>Message:</strong><br>${escapeHtml(submission.message || 'Not provided').replace(/\n/g, '<br>')}</p>
      `,
    });

    if (emailError) {
      console.error('Resend contact submission failed:', emailError);
      return NextResponse.json(
        { success: false, error: 'Unable to send your request. Please try again shortly.' },
        { status: 502 },
      );
    }

    const { error: databaseError, data } = await supabase
      .from('contacts')
      .insert([{
        name: submission.identity,
        email: submission.email,
        message: submission.message,
        identity: submission.identity,
        project_name: submission.projectName,
        needs: submission.needs,
        budget: submission.budget,
        phone: submission.phone,
      }])
      .select('id')
      .single();

    if (databaseError) {
      console.error('Contact submission storage failed:', databaseError);
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to send your request. Please try again shortly.' },
      { status: 500 },
    );
  }
}
