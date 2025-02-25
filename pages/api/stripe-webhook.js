import Stripe from 'stripe';
import { buffer } from 'micro';

// This is your Stripe CLI webhook secret for testing your endpoint locally.

let stripeKey;
let endpointSecret;

if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK_PROD;
    endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET_PROD;
} else {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK;
    endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET;
}

const stripe = new Stripe(stripeKey);

export const config = { api: { bodyParser: false } };

async function updateCustomerWithTrial(customerId) {
    await stripe.customers.update(customerId, { metadata: { usedFreeTrial: 'true' } });
}

export default async function handler(request, response) {
    if (request.method === 'POST') {
        const buf = await buffer(request);
        const sig = request.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
            const session = event.data.object;
            await updateCustomerWithTrial(session.customer);
        }

        // Return a 200 response to acknowledge receipt of the event
        response.send({ message: event });
    }
}
