import { useEffect, useCallback } from 'react';
import firebase from '../firebase/clientApp';
import 'firebaseui/dist/firebaseui.css';

export default function Auth() {
    const loadFirebaseUi = useCallback(async () => {
        const firebaseui = await import('firebaseui');

        const uiConfig = () => ({
            signInSuccessUrl: '/',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                // eslint-disable-next-line object-shorthand
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    console.log('results', authResult.user, redirectUrl);
                    localStorage.setItem('result', authResult.user);
                    return true;
                },

            },
        });

        const ui = firebaseui.auth.AuthUI.getInstance()
        || new firebaseui.auth.AuthUI(firebase.auth());

        // if (ui.isPendingRedirect()) {
        //     ui.start('#firebaseui-auth-container', uiConfig);
        // }

        ui.start('#firebaseui-auth-container', uiConfig());
    }, []);

    useEffect(() => {
        loadFirebaseUi();
    }, [loadFirebaseUi]);

    return (
        <div>
        Login Page
            <div id="firebaseui-auth-container" />
        </div>
    );
}
