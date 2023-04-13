/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import {
    Input, Button, Form, Card, Layout,
} from 'antd';
import Link from 'next/link';
import Image from 'next/image';

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

import styles from '../styles/Home.module.css';

// import forgotPasswordImage from '../public/icons/forgotpass.svg';

const defaultCredentials = { username: '' };

const { Content, Header } = Layout;

export default function PasswordReset() {
    const [credentials, setCredentials] = useState(defaultCredentials);
    const [submitting, setSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const sendReset = async () => {
        setSubmitting(true);
        const auth = getAuth();
        const { username } = credentials;

        try {
            await sendPasswordResetEmail(auth, username);
            console.log('Password reset email sent');
        } catch (error) {
            console.error('Error sending password reset email:', error.message);
        }
    };

    const handleForgotPassword = () => {
        sendReset().then(() => {
            setTimeout(() => {
                setSubmitting(false);
                console.log('Email Link Sent');
                setEmailSent(true);
            }, 1500);
        });
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        console.log(credentials.username);
    }, [credentials]);

    return (
        <>
            <Header className={`${styles.title} ${styles.header}`}>
                <div className={styles.logoContainer}>
                    <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                    <p className={styles.logoText}>SUPPLY MATE</p>
                </div>
            </Header>
            <Content style={{
                height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'column',
            }}
            >
                <div className={styles.forgotPasswordPage}>
                    <p style={{ fontSize: '1.5rem' }}>Password Reset</p>
                    <Card bordered={false} style={{ backgroundColor: 'rgb(202 202 234 / 3%)' }}>
                        {!emailSent ? (
                            <Form name="passwordReset" onFinish={handleForgotPassword} className={styles.loginForm}>
                                <Form.Item required={false} name="username" rules={[{ required: true, message: 'Please input email' }]} className={styles.formRow}>
                                    <Input name="username" placeholder="Enter Email..." value={credentials.username} onChange={handleChange} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className={styles.loginButton}>
                                        {submitting ? 'Sending Reset Email...' : 'Reset'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        ) : <div style={{ textAlign: 'center' }}><p>Password Reset Successfully Sent. Please Check Email. </p><Link href="/">Return to Login</Link></div>}
                    </Card>
                </div>
                {/* <div style={{ position: 'absolute', bottom: '-23px' }}>
                    <Image src={forgotPasswordImage} alt="forgot password image" height={250} width={400} />
                </div> */}
            </Content>
        </>
    );
}
