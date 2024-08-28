
import Stripe from 'stripe';
import prisma from '@/libs/prismadb';
import { NextResponse } from 'next/server';
import { CartProductType } from '@/app/product/[productId]/ProductDetails';
import { getCurrentUser } from '@/actions/getCurrentUser';

// HIGHLIGHT: Update to latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc: number, item) => {
    const itemTotal = item.price * item.quantity;
    return acc + itemTotal;
  }, 0);

  // HIGHLIGHT: Ensure price is always an integer
  return Math.round(totalPrice * 100);
};

export async function POST(request: Request) {
  try { // HIGHLIGHT: Added try-catch for better error handling
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, payment_intent_id } = body;
    const total = calculateOrderAmount(items);
    
    const orderData = {
      user: { connect: { id: currentUser.id } },
      amount: total,
      currency: 'usd',
      status: 'pending',
      deliveryStatus: 'pending',
      paymentIntentId: payment_intent_id,
      products: items,
    };

    if (payment_intent_id) {
      const current_Intent = await stripe.paymentIntents.retrieve(payment_intent_id);

      if (current_Intent) {
        const updated_intent = await stripe.paymentIntents.update(payment_intent_id, { amount: total });

        const [existing_order, update_order] = await Promise.all([
          prisma.order.findFirst({
            where: { paymentIntentId: payment_intent_id },
          }),
          prisma.order.update({
            where: { paymentIntentId: payment_intent_id },
            data: {
              amount: total,
              products: items,
            },
          }),
        ]);

        if (!existing_order) {
          return NextResponse.json({ error: 'Invalid Payment Intent' }, { status: 400 });
        }

        return NextResponse.json({ paymentIntent: updated_intent });
      }
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      orderData.paymentIntentId = paymentIntent.id;

      await prisma.order.create({
        data: orderData,
      });

      return NextResponse.json({ paymentIntent });
    }
    
    return NextResponse.error()

  } catch (error) {
    console.error('Error in payment intent creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





