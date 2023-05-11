import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

const initStripe = async () => {
    if (!stripePromise) {
        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
            stripePromise = await loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PK_PROD}`);
        } else {
            stripePromise = await loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PK}`);
        }
    }

    return stripePromise;
};

export default initStripe;
