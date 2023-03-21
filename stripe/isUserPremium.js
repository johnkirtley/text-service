import { firebaseAuth } from '../firebase/clientApp';

async function isUserPremium() {
    await firebaseAuth.currentUser?.getIdToken(true);
    const decodedToken = await firebaseAuth.currentUser?.getIdTokenResult();

    const role = decodedToken?.claims?.stripeRole || '';

    return { planName: role };
}

export default isUserPremium;
