const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SK);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, returnUrl } = req.body;

        const customer = await stripe.customers.list({ email });

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.data[0].id,
            return_url: returnUrl,
        });
        console.log('session', session);
        const { url } = session;
        res.status(200).json({ message: 'Portal Session Created', url });
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
