/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { useCallback, useState } from 'react';
import Image from 'next/image';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
    collection, doc, setDoc, serverTimestamp, query, where, getDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import {
    Form, Input, Button, Alert, Divider, Card, Layout, Checkbox,
} from 'antd';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth, firestore } from '../firebase/clientApp';
// import LoginImage from '../public/login.png';

// styles
import styles from '../styles/Home.module.css';

const defaultCredentials = {
    username: '',
    password: '',
    confirmPass: '',
};

const { Header } = Layout;

export default function SignIn() {
    const [credentials, setCredentials] = useState(defaultCredentials);
    const [showError, setShowError] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidPass, setInvalidPass] = useState(false);
    const [checkbox, setCheckbox] = useState(false);
    // const [showAlert, setShowAlert] = useState(false);
    const [registerAccount, setRegisterAccount] = useState(false);
    const provider = new GoogleAuthProvider();
    const router = useRouter();

    const auth = firebaseAuth;

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

        const usersRef = doc(firestore, 'users', user.email);
        const userSnap = await getDoc(usersRef);

        if (!userSnap.exists()) {
            setDoc(usersRef, {
                email: `${user.email}`,
                repNumbers: [],
                products: [],
                businessName: '',
                completedOrders: [],
                accountCreatedTimestamp: serverTimestamp(),
                uid: uuidv4(),
                pendingOrders: [],
                firstLoad: true,
                analytics: [],
                premiumSettings: {
                    directText: false,
                    pendingEmails: false,
                    monthlyEmails: false,
                },
            }).then(() => {
                createStripeSubscription(user.email).then((res) => {
                    router.push('/');
                }).catch((err) => console.log(err));
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

    const signUp = async () => {
        setShowError(false);
        const { username, password, confirmPass } = credentials;

        if (username.length < 1 || password.length < 1) {
            return;
        }

        if (password !== confirmPass) {
            setShowError(true);
            setCheckbox(false);

            setTimeout(() => {
                setShowError(false);
            }, 1200);
            return;
        }

        if (password.length < 6) {
            setInvalidPass(true);
            setCheckbox(false);

            setTimeout(() => {
                setInvalidPass(false);
            }, 1200);
            return;
        }

        setRegisterAccount(true);

        createUserWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                const { user } = userCredential;
                setShowError(false);
                setEmailExists(false);
                setInvalidEmail(false);
                setInvalidPass(false);

                const usersRef = doc(collection(firestore, 'users'), user.email.toLowerCase());

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
                });
                createStripeSubscription(user.email).then((res) => {
                    setRegisterAccount(false);
                    router.push('/');
                }).catch((err) => console.log(err));
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setRegisterAccount(false);

                if (errorMessage.includes('email-already-in-use')) {
                    setEmailExists(true);
                    setCheckbox(false);

                    setTimeout(() => {
                        setEmailExists(false);
                    }, 1200);
                }

                if (errorMessage.includes('invalid-email')) {
                    setInvalidEmail(true);
                    setCheckbox(false);

                    setTimeout(() => {
                        setInvalidEmail(false);
                    }, 1200);
                }
            });
    };

    const handleChange = useCallback((e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    }, [credentials]);

    const checkBoxChange = (e) => {
        setCheckbox(e.target.checked);
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
                <div className={styles.registerContainer}>
                    <div className={styles.getStartedTextContainer}>
                        <p className={styles.getStartedText}>Get Started</p>
                        <p className={styles.getStartedSubText}>Create Your Account Below</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className={styles.signInWithGoogle}
                    >
                        <Image src="/google.png" width={30} height={30} alt="Google Login Image" />
                        <p className={styles.googleSignInText}>Sign In With Google</p>
                    </button>
                    <div className={styles.useEmailContainer}>
                        <Divider className={styles.registerDivider} />
                        <p className={styles.useEmailText}>Or Use Email</p>
                        <Divider className={styles.registerDivider} />
                    </div>
                    {invalidPass ? <Alert message="Password must be at least 6 characters" type="error" /> : ''}
                    {showError ? <Alert message="Error: Passwords do not match" type="error" /> : ''}
                    {emailExists ? <Alert message="Error: Email already exists" type="error" /> : ''}
                    {invalidEmail ? <Alert message="Error: Invalid email" type="error" /> : ''}
                    <Card bordered={false}>
                        <Form name="Register" onFinish={signUp} className={styles.registerForm}>
                            <Form.Item label="Email" name="username" rules={[{ required: true, message: 'Please input email' }]} className={styles.formRow} required={false}>
                                <Input name="username" value={credentials.username} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item label="Password" name="password" extra="Password must be at least 6 characters" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow} required={false}>
                                <Input.Password name="password" value={credentials.password} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item label="Confirm Password" name="confirmPass" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow} required={false}>
                                <Input.Password name="confirmPass" value={credentials.confirmPass} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item>
                                <Checkbox onChange={checkBoxChange} checked={checkbox}>
                                    <p style={{ fontSize: '.75rem' }}>Authorize Supply Mate for restock-related text alerts. Msg/data rates apply.</p>
                                </Checkbox>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className={styles.registerButton} disabled={!checkbox}>
                                    {registerAccount ? 'Registering...' : 'Register'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    <div className={styles.loginLink}>
                        <span>Have an account? </span><Link href="/login">Login</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
