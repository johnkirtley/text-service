import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

const initStripe = async () => {
    if (!stripePromise) {
        stripePromise = await loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PK}`);
    }

    return stripePromise;
};

export default initStripe;
