/* eslint-disable no-unused-vars */
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { firebaseAuth } from '../firebase/clientApp';

export default function Auth() {
    const provider = new GoogleAuthProvider();
    const router = useRouter();

    const auth = firebaseAuth;

    const signIn = async () => signInWithPopup(auth, provider).then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const { accessToken } = credential;
        const { user } = result;
        router.push('/');
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const { email } = error.customData;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
    });

    return (
        <div>
        Login Page
            <div id="firebaseui-auth-container" />
            <button type="button" onClick={() => signIn()}>Sign In With Google</button>
        </div>
    );
}
