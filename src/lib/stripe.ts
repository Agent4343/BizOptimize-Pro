import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe secret key not found. Stripe functionality will be disabled.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Stripe product/price IDs - these should be created in Stripe Dashboard
// For now, we'll use dynamic pricing
export const STRIPE_CONFIG = {
  // Module pricing (in cents)
  MODULE_PRICES: {
    first: 9900, // $99/month
    additional: 7400, // $74/month (25% discount)
  },
  CURRENCY: 'cad', // Canadian dollars
};

export async function createCheckoutSession(
  customerId: string,
  moduleId: string,
  priceId: string,
  metadata: Record<string, string> = {}
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: {
      moduleId,
      ...metadata,
    },
  });

  return session;
}

export async function createOrGetCustomer(email: string, userId: string) {
  // Check if customer exists
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}

export async function createSubscription(customerId: string, priceId: string, metadata: Record<string, string> = {}) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  return subscription;
}

