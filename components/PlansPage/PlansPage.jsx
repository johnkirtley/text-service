/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import Image from 'next/image';
import { Card, Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import createCheckoutSession from '../../stripe/createCheckoutSession';
import usePremiumStatus from '../../stripe/usePremiumStatus';
import { useAuth } from '../../Context/AuthContext';
import generatePortal from '../../stripe/createPortal';

import stripeIcon from '../../public/icons/stripe.png';

import planInfo from './planInfo';
import styles from './plans.module.css';

export default function PlansPage() {
    const [planClicked, setPlanClicked] = useState(false);
    const { user } = useAuth();

    const isUserPremium = usePremiumStatus(user);

    const handleBilling = (planType) => {
        setPlanClicked(true);

        if (isUserPremium.planName === '') {
            createCheckoutSession(user.uid, planType);
        } else {
            generatePortal();
        }
    };

    const cardStyles = {
        borderRadius: '10px',
        boxShadow: '16px 10px 15px -8px rgb(77 77 77 / 18%), 0 0px 0px 0 rgb(77 77 77 / 4%)',

    };
    return (
        <div>
            <Link href="/">
                <div className={styles.goHome}>
                    <div>
                        <ArrowLeftOutlined />
                    </div>
                    <p>Go Home</p>
                </div>
            </Link>
            {planClicked ? <Modal open={planClicked} title="Redirecting To Stripe" footer={null} centered closable={false}>Loading...</Modal> : ''}
            <div className={styles.planGrid}>
                <div style={{ fontSize: '2rem' }}>Select Plan</div>
                {planInfo.map((plan, id) => (
                    <Card title={plan.name} key={id} style={cardStyles}>
                        <div className={styles.cardBody}>
                            <div className={styles.cardBody}>
                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <div className={styles.planPrice}>{plan.price}</div>
                                    <div style={{ fontWeight: '500' }}>&#9200; 14 Day Free Trial</div>
                                </div>
                                <ul className={styles.planUl}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Features:</div>
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className={styles.feature}>&#9989; <span style={{ marginLeft: '0.5rem' }}>{feature}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                {isUserPremium.planName === plan.name ? <Button type="primary" className={styles.planButton} disabled>Current Plan</Button>
                                    : <Button type="primary" className={styles.planButton} onClick={() => handleBilling(plan.name)}>Select {plan.name} Plan</Button>}
                            </div>
                        </div>
                    </Card>
                ))}
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <div style={{ fontStyle: 'italic', whiteSpace: 'pre' }}>Billing and Subscriptions Managed By </div>
                    <Image src={stripeIcon} alt="stripe icon" height={50} width={50} />
                </div>
            </div>
        </div>
    );
}
