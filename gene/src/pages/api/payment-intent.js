    // pages/api/payment-intent.js

    import Stripe from 'stripe';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    });

    export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: 'usd',
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
    }
