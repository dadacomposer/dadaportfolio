import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We map the payload from the frontend to our new Supabase columns
    // We provide fallbacks for the required name and email columns
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

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
