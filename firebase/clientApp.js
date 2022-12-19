import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { getAuth } from 'firebase/auth';

// const clientCredentials = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

const firebaseConfig = {
    apiKey: 'AIzaSyDOjseGmlhjbrFeo7EZPbqlxJ_zEwZzwEk',
    authDomain: 'text-service-55a94.firebaseapp.com',
    projectId: 'text-service-55a94',
    storageBucket: 'text-service-55a94.appspot.com',
    messagingSenderId: '90069723064',
    appId: '1:90069723064:web:417cf98f5513b532ead14d',
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);

export { firebaseApp, firestore, firebaseAuth };
