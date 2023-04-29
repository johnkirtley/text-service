/* eslint-disable no-unused-vars */
import { useState } from 'react';
import Image from 'next/image';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import {
    Form, Input, Button, Alert, Divider, Card, Layout,
} from 'antd';
import {
    getDocs, query, where, doc, collection, setDoc, serverTimestamp, getDoc,
} from 'firebase/firestore';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth, firestore } from '../firebase/clientApp';
import sampleDashboard from '../public/sampleDashboard.jpg';
// styles
import styles from '../styles/Home.module.css';

const defaultCredentials = {
    username: '',
    password: '',
};

const { Header } = Layout;

export default function Login() {
    const [credentials, setCredentials] = useState(defaultCredentials);
    const [showError, setShowError] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const provider = new GoogleAuthProvider();
    const router = useRouter();

    const auth = firebaseAuth;

    async function addToSib(email) {
        const response = await fetch('/api/sib-add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newUserEmail: email }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('SIB User Added: ', data);
        } else {
            console.error('Error:', response);
        }
    }

    async function createStripeSubscription(email) {
        const response = await fetch('/api/create-on-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
        } else {
            console.error('Error:', response.statusText);
        }
    }

    const signInWithGoogle = async () => signInWithPopup(auth, provider).then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const { accessToken } = credential;
        const { user } = result;

        console.log('token', accessToken);

        const usersRef = doc(firestore, 'users', user.email);
        const userSnap = await getDoc(usersRef);

        if (!userSnap.exists()) {
            setDoc(usersRef, {
                email: `${user.email}`,
                repNumbers: [],
                products: [],
                businessName: '',
                accountCreatedTimestamp: serverTimestamp(),
                uid: uuidv4(),
                pendingOrders: [],
                completedOrders: [],
                firstLoad: true,
                analytics: [],
                premiumSettings: {
                    directText: false,
                    pendingEmails: false,
                    monthlyEmails: false,
                },

            }).then(() => {
                createStripeSubscription(user.email).then((res) => {
                    addToSib(user.email);
                    router.push('/');
                }).catch((err) => console.log(err));
            });
        } else {
            router.push('/');
        }
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
    });

    const signIn = async () => {
        setShowError(false);
        const { username, password } = credentials;

        if (username.length < 1 || password.length < 1) {
            return;
        }

        setLoggingIn(true);

        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                const { user } = userCredential;
                setLoggingIn(false);
                router.push('/');
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setLoggingIn(false);
                if (errorMessage) {
                    setShowError(true);

                    setTimeout(() => {
                        setShowError(false);
                    }, 1200);
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
        <>
            <Header className={`${styles.title} ${styles.header}`}>
                <div className={styles.logoContainer}>
                    <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                    <p className={styles.logoText}>SUPPLY MATE</p>
                </div>
            </Header>
            <div className={styles.registerMainContainer}>
                <div className={styles.loginContainer}>
                    <div className={styles.getStartedTextContainer}>
                        <p className={styles.getStartedText}>Welcome Back &#128075;</p>
                        {/* <p className={styles.getStartedSubText}>Login Below</p> */}
                    </div>
                    <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className={styles.signInWithGoogle}
                    >
                        <Image src="/google.png" width={30} height={30} alt="Google SSO Image" />
                        <p className={styles.googleSignInText}>Sign In With Google</p>
                    </button>
                    <div className={styles.useEmailContainer}>
                        <Divider className={styles.registerDivider} />
                        <p className={styles.useEmailText}>Or Use Email</p>
                        <Divider className={styles.registerDivider} />
                    </div>
                    {showError ? <Alert message="Error: Please Check Email and Password" type="error" /> : ''}
                    <Card bordered={false}>
                        <Form name="Login" onFinish={signIn} className={styles.loginForm}>
                            <Form.Item required={false} label="Email" name="username" rules={[{ required: true, message: 'Please input email' }]} className={styles.formRow}>
                                <Input name="username" value={credentials.username} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: '0' }} required={false} label="Password" name="password" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow}>
                                <Input.Password name="password" value={credentials.password} onChange={handleChange} />
                            </Form.Item>
                            <div className={styles.forgotPasswordText}>
                                <Link href="/password-reset">Forgot Password?</Link>
                            </div>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className={styles.loginButton} style={{ marginTop: '24px' }}>
                                    {loggingIn ? 'Logging In...' : 'Login'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                    <div className={styles.loginLink}>
                        <span>Need To Register? </span><Link href="/register">Click Here</Link>
                    </div>
                </div>
            </div>
        </>

    );
}
