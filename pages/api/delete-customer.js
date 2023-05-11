let stripeKey;

if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK_PROD;
} else {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK;
}

const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { customerId } = req.body;

        const customer = await stripe.customers.del(customerId);

        res.status(200).json({ message: 'Customer Deleted', customer });
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
