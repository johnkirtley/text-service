const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SK);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        const customer = await stripe.customers.list({ email });

        const sub = await stripe.subscriptions.list({ customer: customer.data[0]?.id, limit: 1 });

        if (sub) {
            res.status(200).json({ message: 'Subscription found', sub });
        } else {
            res.status(500).json({ message: `No Subscription Found For ${email}` });
        }
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
