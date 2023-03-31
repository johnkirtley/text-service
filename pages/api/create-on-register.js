const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SK);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        const customer = await stripe.customers.create({
            email,
            metadata: { usedFreeTrial: false },
        });

        // const subscription = await stripe.subscriptions.create({
        //     customer: customer.id,
        //     items: [{ price: 'price_1MmgzZGYpJAcieX9hlUJPOOH' }],
        //     trial_period_days: 14,
        //     trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        // });

        const createdUser = { customer };

        res.status(200).json({ message: 'Customer Created', createdUser });
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
