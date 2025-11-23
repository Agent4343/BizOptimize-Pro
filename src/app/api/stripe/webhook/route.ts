import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const moduleId = session.metadata?.moduleId;

  if (!userId || !moduleId) {
    console.error('Missing userId or moduleId in checkout session metadata');
    return;
  }

  const subscriptionId = typeof session.subscription === 'string' 
    ? session.subscription 
    : session.subscription?.id;

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = subscription as any; // Type assertion for compatibility

  // Create or update subscription in database
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    module_id: moduleId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer as string,
    status: subscription.status,
    current_period_start: new Date((subData.current_period_start || 0) * 1000).toISOString(),
    current_period_end: new Date((subData.current_period_end || 0) * 1000).toISOString(),
    cancel_at_period_end: subData.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const subData = subscription as any; // Type assertion for compatibility

  // Update subscription in database
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subData.current_period_start || 0) * 1000).toISOString(),
      current_period_end: new Date((subData.current_period_end || 0) * 1000).toISOString(),
      cancel_at_period_end: subData.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Mark subscription as canceled in database
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceData = invoice as any; // Type assertion for compatibility
  const subscriptionId = typeof invoiceData.subscription === 'string'
    ? invoiceData.subscription
    : invoiceData.subscription?.id;

  if (subscriptionId) {
    // Update subscription status if needed
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceData = invoice as any; // Type assertion for compatibility
  const subscriptionId = typeof invoiceData.subscription === 'string'
    ? invoiceData.subscription
    : invoiceData.subscription?.id;

  if (subscriptionId) {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }
}

