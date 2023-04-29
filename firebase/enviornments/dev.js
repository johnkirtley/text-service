const devFirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
};

export default devFirebaseConfig;
