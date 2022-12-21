/* eslint-disable no-unused-vars */
import { useState } from 'react';
import Image from 'next/image';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import {
    Form, Input, Button, Alert, Divider,
} from 'antd';
import {
    getDocs, query, where, doc, collection, setDoc, serverTimestamp, getDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth, firestore } from '../firebase/clientApp';

const defaultCredentials = {
    username: '',
    password: '',
};

export default function Login() {
    const [credentials, setCredentials] = useState(defaultCredentials);
    const [showError, setShowError] = useState(false);
    const provider = new GoogleAuthProvider();
    const router = useRouter();

    const auth = firebaseAuth;

    const signInWithGoogle = async () => signInWithPopup(auth, provider).then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const { accessToken } = credential;
        const { user } = result;

        const usersRef = doc(firestore, 'users', user.email);
        const userSnap = await getDoc(usersRef);

        if (!userSnap.exists()) {
            setDoc(usersRef, {
                email: `${user.email}`, repNumbers: [], products: [], businessName: '', accountCreatedTimestamp: serverTimestamp(), uid: uuidv4(),
            }).then(() => {
                router.push('/');
            });
        } else {
            router.push('/');
        }
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const { email } = error.customData;
        const credential = GoogleAuthProvider.credentialFromError(error);
    });

    const signIn = async () => {
        setShowError(false);
        const { username, password } = credentials;

        if (username.length < 1 || password.length < 1) {
            return;
        }

        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                const { user } = userCredential;
                router.push('/');
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorMessage) {
                    setShowError(true);
                }
            });
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (

        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'column', gap: '2rem', width: '100%', marginTop: '8rem',
        }}
        >
            {showError ? <Alert message="Error: Please Check Email and Password" type="error" /> : ''}
            <h2>Login</h2>

            <Form name="Login" onFinish={signIn} style={{ textAlign: 'center', width: '40%' }}>
                <Form.Item label="username" name="username" rules={[{ required: true, message: 'Please input username' }]}>
                    <Input name="username" value={credentials.username} onChange={handleChange} />
                </Form.Item>
                <Form.Item label="password" name="password" rules={[{ required: true, message: 'Please input password' }]}>
                    <Input.Password name="password" value={credentials.password} onChange={handleChange} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Login
                    </Button>
                </Form.Item>
            </Form>
            <Divider style={{ margin: '0' }} />
            <button
                type="button"
                onClick={() => signInWithGoogle()}
                style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', width: '23%', gap: '1rem', padding: '0.5rem 0', background: 'none',
                }}
            >
                <Image src="/google.png" width={30} height={30} />
                <p className="google-sign-in" style={{ margin: '0', fontWeight: '600' }}>Sign In With Google</p>
            </button>
            <div>
                <Link href="/register">Need To Register?</Link>
            </div>
        </div>
    );
}
