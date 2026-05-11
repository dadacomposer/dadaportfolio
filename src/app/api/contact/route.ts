import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const client = createClient({
    projectId: '4o79sm04',
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });

  try {
    const body = await req.json();
    
    const result = await client.create({
      _type: 'contact',
      identity: body.identity,
      projectName: body.projectName,
      needs: body.needs,
      budget: body.budget,
      email: body.email,
      phone: body.phone,
      message: body.message,
      submittedAt: new Date().toISOString(),
    });

    // If you also want to send an email notification, you could do it here
    // using Resend or a similar service.

    return NextResponse.json({ success: true, id: result._id });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
