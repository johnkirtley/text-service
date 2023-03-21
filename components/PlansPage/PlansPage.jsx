/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import createCheckoutSession from '../../stripe/createCheckoutSession';
import usePremiumStatus from '../../stripe/usePremiumStatus';
import { useAuth } from '../../Context/AuthContext';
import generatePortal from '../../stripe/createPortal';

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
                {planInfo.map((plan, id) => (
                    <Card title={plan.name} key={id}>
                        <div className={styles.cardBody}>
                            <div className={styles.cardBody}>
                                <div className={styles.planPrice}>{plan.price}</div>
                                <ul>
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className={styles.feature}>{feature}</li>
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
            </div>
        </div>
    );
}
