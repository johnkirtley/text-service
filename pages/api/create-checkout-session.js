let stripeKey;

if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK_PROD;
} else {
    stripeKey = process.env.NEXT_PUBLIC_STRIPE_SK;
}

const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { successUrl, product, email } = req.body;

        const customer = await stripe.customers.list({ email, limit: 1 });
        const checkForTrial = customer.data[0].metadata.usedFreeTrial;

        if (checkForTrial === 'true') {
            const session = await stripe.checkout.sessions.create({
                success_url: successUrl,
                cancel_url: successUrl,
                customer: customer.data[0].id,
                // customer_email: email,
                allow_promotion_codes: true,
                line_items: [
                    { price: product, quantity: 1 },
                ],
                mode: 'subscription',
            });
            res.status(200).json({ message: 'Checkout Created No Free Trial', session });
        }

        if (checkForTrial === 'false') {
            const session = await stripe.checkout.sessions.create({
                success_url: successUrl,
                cancel_url: successUrl,
                customer: customer.data[0].id,
                // customer_email: email,
                allow_promotion_codes: true,
                subscription_data: { trial_period_days: 7 },
                line_items: [
                    { price: product, quantity: 1 },
                ],
                mode: 'subscription',
            });
            res.status(200).json({ message: 'Checkout Created Free Trial', session });
        }
    } else {
        res.status(500).json({ message: 'Method Not Allowed' });
    }
}
