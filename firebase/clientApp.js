import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { devFirebaseConfig, stagingFirebaseConfig, prodFirebaseConfig } from './enviornments';

let firebaseConfig;

if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    firebaseConfig = devFirebaseConfig;
}

if (process.env.NEXT_PUBLIC_ENV === 'staging') {
    firebaseConfig = stagingFirebaseConfig;
}

if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    firebaseConfig = prodFirebaseConfig;
}

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);
const firebaseFunctions = getFunctions(firebaseApp, 'us-central1');

export { firebaseApp, firestore, firebaseAuth, firebaseFunctions };
