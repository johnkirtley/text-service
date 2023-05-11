let stripeKey;

if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK_PROD;
} else {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK;
}

const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, returnUrl } = req.body;

        const customer = await stripe.customers.list({ email });

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.data[0].id,
            return_url: returnUrl,
        });
        const { url } = session;
        res.status(200).json({ message: 'Portal Session Created', url });
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
