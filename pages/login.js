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

    const signInWithGoogle = async () => signInWithPopup(auth, provider).then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const { accessToken } = credential;
        const { user } = result;

        const usersRef = doc(firestore, 'users', user.email);
        const userSnap = await getDoc(usersRef);

        if (!userSnap.exists()) {
            setDoc(usersRef, {
                email: `${user.email}`, repNumbers: [], products: [], businessName: '', accountCreatedTimestamp: serverTimestamp(), uid: uuidv4(), pendingOrders: [], completedOrders: [], firstLoad: true,

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
            LOGO HERE
            </Header>
            <div className={styles.registerMainContainer}>
                <div className={styles.loginRegister}>
                    <p className={styles.registerHeader}>Unlock Restock Insights.
                    </p>
                    <p className={styles.registerAdditionalInfo}>
                    Utilize Supply Mate&apos;s Dashboard
                    To See Analytics On Your Customers and Restocks.
                    </p>
                    {/* <Image src={LoginImage} alt="Caption" /> */}
                    <div className={styles.dashImageContainer}>
                        <Image src={sampleDashboard} alt="Sample Dashboard" className={styles.dashboardImage} fill />
                    </div>
                </div>
                <div className={styles.loginContainer}>
                    {showError ? <Alert message="Error: Please Check Email and Password" type="error" /> : ''}
                    <div className={styles.getStartedTextContainer}>
                        <p className={styles.getStartedText}>Welcome Back</p>
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
                    <Card bordered={false}>
                        <Form name="Login" onFinish={signIn} className={styles.loginForm}>
                            <Form.Item required={false} label="Email" name="username" rules={[{ required: true, message: 'Please input email' }]} className={styles.formRow}>
                                <Input placeholder="Enter Email..." name="username" value={credentials.username} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item required={false} label="Password" name="password" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow}>
                                <Input.Password placeholder="Enter Password..." name="password" value={credentials.password} onChange={handleChange} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className={styles.loginButton}>
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
