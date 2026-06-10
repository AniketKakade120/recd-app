import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import RecommendationEmail from '@/emails/RecommendationEmail';
import VerdictEmail from '@/emails/VerdictEmail';
import CrewRequestEmail from '@/emails/CrewRequestEmail';
import GroupRecommendationEmail from '@/emails/GroupRecommendationEmail';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Initialize clients inside the request handler so Vercel doesn't crash during build step
  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await request.json();
    const { type, emailData, toUserId } = body;

    if (!toUserId) {
      return NextResponse.json({ error: 'Missing toUserId parameter' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'Missing email type' }, { status: 400 });
    }

    // Securely fetch the user's email from the database
    // Note: We extract the auth token from the incoming request so the RPC knows we are authenticated
    const authHeader = request.headers.get('Authorization');
    
    let toEmail = null;
    if (authHeader) {
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data, error } = await userClient.rpc('get_user_email', { uid: toUserId });
      if (!error && data) {
        toEmail = data;
      }
    }

    if (!toEmail) {
      console.error('Could not find email for user:', toUserId);
      return NextResponse.json({ error: 'User email not found or missing auth' }, { status: 404 });
    }

    let subject = '';
    let reactComponent = null;

    switch (type) {
      case 'recommendation':
        subject = `${emailData.senderName} recommended ${emailData.titleName} to you!`;
        reactComponent = RecommendationEmail(emailData);
        break;
      case 'group_recommendation':
        subject = `${emailData.senderName} dropped a rec in ${emailData.groupName}!`;
        reactComponent = GroupRecommendationEmail(emailData);
        break;
      case 'verdict':
        subject = `${emailData.reviewerName} gave a verdict on your recommendation!`;
        reactComponent = VerdictEmail(emailData);
        break;
      case 'crew_request':
        subject = `${emailData.senderName} sent you a Crew Request!`;
        reactComponent = CrewRequestEmail(emailData);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    if (!reactComponent) {
      return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 });
    }

    const data = await resend.emails.send({
      from: 'Rec\'d Club <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      react: reactComponent,
    });
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
