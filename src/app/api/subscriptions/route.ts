import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', token.sub)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return NextResponse.json({ subscriptions: subscriptions || [] });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

