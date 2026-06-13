import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Insert contact info into Supabase
    const { error, data } = await supabase.from('contacts').insert([{
      name: body.identity || 'Unknown',
      email: body.email || 'No email',
      message: body.message || '',
      identity: body.identity,
      project_name: body.projectName,
      needs: body.needs,
      budget: body.budget,
      phone: body.phone,
    }]).select('id').single();

    if (error) throw error;

    // 2. Post to Slack webhook securely
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const slackMessage = {
          text: `📬 *New Contact Inquiry Submitted!*`,
          attachments: [
            {
              color: '#3b82f6', // Accent blue
              fields: [
                { title: 'Client Name', value: body.identity || 'Unknown', short: true },
                { title: 'Email', value: body.email || 'No email', short: true },
                { title: 'Project Name', value: body.projectName || 'Not specified', short: true },
                { title: 'Budget', value: body.budget || 'Not specified', short: true },
                { title: 'Phone', value: body.phone || 'Not specified', short: true },
                { title: 'Project Type / Needs', value: Array.isArray(body.needs) ? body.needs.join(', ') : (body.needs || 'Not specified'), short: false },
                { title: 'Message', value: body.message || 'No message provided', short: false }
              ],
              ts: Math.floor(Date.now() / 1000)
            }
          ]
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        });
      } catch (slackErr) {
        console.error('Failed to notify Slack about contact submission:', slackErr);
      }
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
