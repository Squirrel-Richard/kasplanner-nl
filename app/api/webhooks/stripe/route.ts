// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const companyId = session.metadata?.company_id
      const plan = session.metadata?.plan || 'starter'

      if (companyId && session.subscription) {
        await admin.from('subscriptions').upsert({
          company_id: companyId,
          plan,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          geldig_tot: null, // Set by subscription.updated
        }, { onConflict: 'company_id' })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.status
      // Access current_period_end safely
      const periodEnd = (sub as any).current_period_end
      const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null

      await admin.from('subscriptions')
        .update({
          geldig_tot: status === 'active' ? currentPeriodEnd : new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await admin.from('subscriptions')
        .update({
          plan: 'gratis',
          stripe_subscription_id: null,
          geldig_tot: null,
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // TODO: send alert to user about failed payment
      console.log('Payment failed for invoice:', invoice.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
