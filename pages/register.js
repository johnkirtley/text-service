/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
    collection, doc, setDoc, serverTimestamp, query, where, getDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import {
    Form, Input, Button, Alert, Divider,
} from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth, firestore } from '../firebase/clientApp';

// styles
import styles from '../styles/Home.module.css';

const defaultCredentials = {
    username: '',
    password: '',
    confirmPass: '',
};

export default function SignIn() {
    const [credentials, setCredentials] = useState(defaultCredentials);
    const [showError, setShowError] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    // const [showAlert, setShowAlert] = useState(false);
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
                accountCreatedTimestamp: serverTimestamp(),
                uid: uuidv4(),
                plan: 'basic',
                pendingOrders: [],
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

        createUserWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                const { user } = userCredential;
                setShowError(false);
                setEmailExists(false);
                setInvalidEmail(false);

                const usersRef = doc(collection(firestore, 'users'), user.email.toLowerCase());

                setDoc(usersRef, {
                    email: `${username.toLowerCase()}`, repNumbers: [], products: [], businessName: '', accountCreatedTimestamp: serverTimestamp(), uid: uuidv4(),
                });

                router.push('/');
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

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

    useEffect(() => {
        console.log(credentials);
    }, [credentials]);

    return (

        <div className={styles.registerContainer}>
            {showError ? <Alert message="Error: Passwords do not match" type="error" /> : ''}
            {emailExists ? <Alert message="Error: Email already exists" type="error" /> : ''}
            {invalidEmail ? <Alert message="Error: Invalid email" type="error" /> : ''}
            <h2>Register</h2>
            <Form name="Register" onFinish={signUp} className={styles.registerForm}>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input username' }]}>
                    <Input name="username" value={credentials.username} onChange={handleChange} />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input password' }]}>
                    <Input.Password name="password" value={credentials.password} onChange={handleChange} />
                </Form.Item>
                <Form.Item label="Confirm Password" name="confirmPass" rules={[{ required: true, message: 'Please input password' }]}>
                    <Input.Password name="confirmPass" value={credentials.confirmPass} onChange={handleChange} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                </Form.Item>
            </Form>
            <Divider className={styles.registerDivider} />
            <button
                type="button"
                onClick={() => signInWithGoogle()}
                className={styles.signInWithGoogle}
            >
                <Image src="/google.png" width={30} height={30} alt="Google Login Image" />
                <p className={styles.googleSignInText}>Sign In With Google</p>
            </button>
            <div>
                <Link href="/login">Have an account?</Link>
            </div>
        </div>
    );
}
