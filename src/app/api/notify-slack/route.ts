import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { trackTitle, commentText, author, playlistTitle } = await req.json();
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Slack webhook URL not configured' }, { status: 500 });
    }

    // Determine color based on content (e.g. green for approval, blue for comment)
    const isApproval = commentText.startsWith('★ APPROVED:');
    const accentColor = isApproval ? '#10b981' : '#3b82f6'; // Green vs Blue

    const messageText = isApproval 
      ? `✅ *Track Approved & Downloaded!*` 
      : `🔔 *New Review Notes Received!*`;

    const slackMessage = {
      text: messageText,
      attachments: [
        {
          color: accentColor,
          fields: [
            {
              title: 'Track',
              value: trackTitle,
              short: true
            },
            {
              title: 'Review Mode / Playlist',
              value: playlistTitle || 'Single Share',
              short: true
            },
            {
              title: 'Author',
              value: author || 'Musicvine Reviewer',
              short: true
            },
            {
              title: 'Feedback',
              value: commentText,
              short: false
            }
          ],
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Slack API responded with status ${res.status}: ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Slack notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
