import {
    collection, query, doc, onSnapshot, addDoc, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { firestore } from '../firebase/clientApp';
import initStripe from './initStripe';

async function createCheckoutSession(uid, planType) {
    const checkoutSessionsRef = collection(doc(firestore, 'customers', uid), 'checkout_sessions');

    if (planType === 'silver') {
        await addDoc(checkoutSessionsRef, {
            price: 'price_1MmgyjGYpJAcieX9UlKd8cfj',
            success_url: window.location.origin,
            cancel_url: window.location.origin,
            timestamp: serverTimestamp(),
        });
    }

    if (planType === 'gold') {
        await addDoc(checkoutSessionsRef, {
            price: 'price_1MmgzqGYpJAcieX9yPRbIvYY',
            success_url: window.location.origin,
            cancel_url: window.location.origin,
            timestamp: serverTimestamp(),
        });
    }

    if (planType === 'bronze') {
        await addDoc(checkoutSessionsRef, {
            price: 'price_1MmgzZGYpJAcieX9hlUJPOOH',
            success_url: window.location.origin,
            cancel_url: window.location.origin,
            timestamp: serverTimestamp(),
        });
    }

    const q = query(checkoutSessionsRef, orderBy('timestamp', 'desc'), limit(1));

    onSnapshot(q, async (snap) => {
        let sessionId;

        snap.forEach((snapDoc) => {
            sessionId = snapDoc.data().sessionId;
        });

        if (sessionId) {
            const stripe = await initStripe();
            stripe.redirectToCheckout({ sessionId });
        }
    });
}

export default createCheckoutSession;
