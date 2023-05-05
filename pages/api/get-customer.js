const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SK);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        const customer = await stripe.customers.list({ email, limit: 1 });

        res.status(200).json({ message: 'Customer found', customer });
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
