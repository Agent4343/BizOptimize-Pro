import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { stripe, createOrGetCustomer, STRIPE_CONFIG } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = token.sub || token.id;

    const { moduleId, isFirstModule } = await request.json();

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    // Get user email
    const email = token.email as string;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create or get Stripe customer
    const customer = await createOrGetCustomer(email, userId as string);

    // Check existing subscriptions to determine if this is first module
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    const isActuallyFirst = !existingSubscriptions || existingSubscriptions.length === 0;
    const priceAmount = isActuallyFirst ? STRIPE_CONFIG.MODULE_PRICES.first : STRIPE_CONFIG.MODULE_PRICES.additional;

    // Create Stripe Price (or use existing price ID if you have one)
    // For production, create prices in Stripe Dashboard and store IDs
    const price = await stripe.prices.create({
      unit_amount: priceAmount,
      currency: STRIPE_CONFIG.CURRENCY,
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: `BizOptimize Pro - ${moduleId}`,
      },
    });

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: userId as string,
        moduleId,
        isFirstModule: isActuallyFirst.toString(),
      },
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

