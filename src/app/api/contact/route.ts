import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
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
      submittedAt: new Error().stack?.includes('POST') ? new Date().toISOString() : undefined, // Just a way to get current date
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
