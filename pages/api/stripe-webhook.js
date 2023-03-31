import Stripe from 'stripe';
import { buffer } from 'micro';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SK);

export const config = { api: { bodyParser: false } };

async function updateCustomerWithTrial(customerId) {
    await stripe.customers.update(customerId, { metadata: { usedFreeTrial: 'true' } });
}

export default async function handler(request, response) {
    if (request.method === 'POST') {
        const buf = await buffer(request);
        const sig = request.headers['stripe-signature'];

        let event;

        console.log('webhook');

        try {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);

            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        console.log('event', event.data.object.customer);
        // Handle the event
        if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
            const session = event.data.object;
            console.log('customer', session);
            await updateCustomerWithTrial(session.customer);
        }

        // Return a 200 response to acknowledge receipt of the event
        response.send({ message: event });
    }
}
