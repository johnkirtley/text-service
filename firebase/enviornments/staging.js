const stagingFirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_STAGING,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_STAGING,
};

export default stagingFirebaseConfig;
