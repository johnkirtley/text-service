const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SK);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { updateType, email, reqSub } = req.body;

        const customer = await stripe.customers.list({ email });
        const getSub = await stripe.subscriptions.list({ customer: customer.id, limit: 1 });

        if (updateType === 'cancel') {
            const cancelled = await stripe.subscriptions.del(getSub.data.id);
            res.status(200).json({ message: 'Subscription cancelled', cancelled });
        }

        if (updateType === 'update') {
            const updated = await stripe.subscriptions.update({ items: [{ price: reqSub }] });
            res.status(200).json({ message: 'Subscription updated', updated });
        }
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
