/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
    collection, doc, setDoc, serverTimestamp, query, where, getDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import {
    Form, Input, Button, Alert, Divider, Card, Layout,
} from 'antd';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth, firestore } from '../firebase/clientApp';
// import LoginImage from '../public/login.png';
import CaptionImage from '../public/captionPic.webp';

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
    // const [showAlert, setShowAlert] = useState(false);
    const [registerAccount, setRegisterAccount] = useState(false);
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

    const signUp = async () => {
        setShowError(false);
        const { username, password, confirmPass } = credentials;

        if (username.length < 1 || password.length < 1) {
            return;
        }

        if (password !== confirmPass) {
            setShowError(true);
            return;
        }

        if (password.length < 6) {
            setInvalidPass(true);
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
                });
                setRegisterAccount(false);
                router.push('/');
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setRegisterAccount(false);

                if (errorMessage.includes('email-already-in-use')) {
                    setEmailExists(true);
                }

                if (errorMessage.includes('invalid-email')) {
                    setInvalidEmail(true);
                }
            });
    };

    const handleChange = useCallback((e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    }, [credentials]);

    return (
        <>
            <Header className={`${styles.title} ${styles.header}`}>
            LOGO HERE
            </Header>
            <div className={styles.registerMainContainer}>
                <div className={styles.desktopRegister}>
                    <p className={styles.registerHeader}>Transforming the way to communicate
                    and receive customer orders.
                    </p>
                    <p className={styles.registerAdditionalInfo}>Elevate your distribution and sales
                     funnel with the power of our Order Management QR Code solution today.
                    </p>
                    {/* <Image src={LoginImage} alt="Caption" /> */}
                    <div className={styles.captionContainer}>
                        <div className={styles.captionContentContainer}>
                            <p> I&apos;m impressed with the results I&apos;ve
                            seen since starting to use Supply Mate. My clients love it.
                            </p>
                        </div>
                        <div className={styles.captionUserContainer}>
                            <Image src={CaptionImage} alt="Caption Image" width={70} height={50} className={styles.captionImage} />
                            <div className={styles.captionUserText}>
                                <p>James Kim</p>
                                <p>AirBnB Host</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.registerContainer}>
                    {invalidPass ? <Alert message="Password must be at least 6 characters" type="error" /> : ''}
                    {showError ? <Alert message="Error: Passwords do not match" type="error" /> : ''}
                    {emailExists ? <Alert message="Error: Email already exists" type="error" /> : ''}
                    {invalidEmail ? <Alert message="Error: Invalid email" type="error" /> : ''}
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
                                <Button type="primary" htmlType="submit" className={styles.registerButton}>
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
