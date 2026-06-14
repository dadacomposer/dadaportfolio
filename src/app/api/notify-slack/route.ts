import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { trackTitle, commentText, author, playlistTitle, type, shareLink } = await req.json();
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Slack webhook URL not configured' }, { status: 500 });
    }

    let messageText = '';
    let accentColor = '#3b82f6';
    let fields: any[] = [];

    if (type === 'share_created') {
      messageText = `📤 *You successfully shared track(s) with Music Vine!*`;
      accentColor = '#8b5cf6'; // Elegant purple for new share links
      fields = [
        {
          title: 'Shared Track(s)',
          value: trackTitle || 'Unknown Track',
          short: true
        },
        {
          title: 'Batch / Playlist Name',
          value: playlistTitle || 'Single Share',
          short: true
        },
        {
          title: 'Direct Shared Page Link',
          value: shareLink || 'No link provided',
          short: false
        }
      ];
    } else {
      // Determine color based on content (e.g. green for approval, blue for comment)
      const isApproval = commentText?.startsWith('★ APPROVED:');
      accentColor = isApproval ? '#10b981' : '#3b82f6'; // Green vs Blue

      messageText = isApproval 
        ? `✅ *Track Approved & Downloaded!*` 
        : `🔔 *New Review Notes Received!*`;

      fields = [
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
          value: commentText || 'No comments',
          short: false
        }
      ];
    }

    const slackMessage = {
      text: messageText,
      attachments: [
        {
          color: accentColor,
          fields: fields,
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
