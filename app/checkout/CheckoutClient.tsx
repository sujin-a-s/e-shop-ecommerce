'use client';

import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import CheckoutForm from './CheckoutForm';
import Button from '../components/Button';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const CheckoutClient = () => {
  const { cartProducts, paymentIntent, handleSetPaymentIntent } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);


  const router = useRouter();
  console.log("paymentintent :",paymentIntent)
  console.log("cleint secret :", clientSecret)

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cartProducts) {
        setLoading(true);
        setError(false);
  
        try {
          const res = await axios.post('/api/create-payment-intent', {
            items: cartProducts,
            payment_intent_id: paymentIntent,
          });
  
          setLoading(false);
          if (res.status === 401) {
            router.push('/login');
            return;
          }
  
          const data = res.data;
          setClientSecret(data.paymentIntent.client_secret);
          handleSetPaymentIntent(data.paymentIntent.id);
        } catch (error) {
          setLoading(false);
          setError(true);
          console.error('Error', error);
          toast.error('Something went wrong');
        }
      }
    };
  
    createPaymentIntent();
  }, [cartProducts, paymentIntent]);


  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      labels: 'floating',
    },
  };

  const handleSetPaymentSuccess = useCallback((value: boolean) => {
    setPaymentSuccess(value);
    setError(false);
  }, []);

  return (
    <div className="w-full">
      {clientSecret && cartProducts && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            clientSecret={clientSecret}
            handleSetPaymentSuccess={handleSetPaymentSuccess}
          />
        </Elements>
      )}
      {loading && <div className="text-center">Loading Checkout . . .</div>}
      {error && (
        <div className="text-center text-rose-500">
          Something went wrong . . .
        </div>
      )}

      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500 text-center">Payment Success</div>
          <div className="max-w-[220px] w-full">
            <Button
              label="View Your Orders"
              onClick={() => router.push('/orders')}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckoutClient;
