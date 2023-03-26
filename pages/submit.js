/* eslint-disable max-len */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from 'react';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { Layout, Button, Spin, Alert } from 'antd';
import { uuidv4 } from '@firebase/util';
import { firestore } from '../firebase/clientApp';
import { querySubCollection } from '../firebase/getUserData';

import styles from '../styles/Home.module.css';

export default function Submit() {
    const [product, setProduct] = useState('');
    const [repNumber, setRepNumber] = useState('');
    const [clientName, setClientName] = useState('');
    // const [ownerName, setOwnerName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [plan, setPlan] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [gettingData, setGettingData] = useState(false);
    const [alreadyAdded, setAlreadyAdded] = useState(false);

    const { Content, Header } = Layout;

    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        useEffect(() => {
            setProduct(urlParams.get('product'));
            setRepNumber(urlParams.get('rep'));
            setClientName(urlParams.get('clientName'));
            setOwnerId(urlParams.get('id'));
        }, [urlParams]);
    }
    const getQuery = useCallback(async (ref) => {
        setGettingData(true);
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        setTimeout(() => {
            if (querySnapshot.empty) {
                setPlan('');
                setGettingData(false);
            }
        }, 2500);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                setEmail(document.data().email);

                querySubCollection('customers', 'email', '==', email, 'subscriptions').then((subCollection) => {
                    if (subCollection.length > 0) {
                        subCollection.forEach((sub) => {
                            if (sub.mostRecentSubDoc?.status === 'active' || sub.mostRecentSubDoc?.status === 'trialing') {
                                setPlan(sub.mostRecentSubDoc?.role);
                            }
                            setTimeout(() => {
                                setGettingData(false);
                            }, 1500);
                        });
                    } else {
                        setTimeout(() => {
                            setGettingData(false);
                        }, 1500);
                    }
                });
            }
        });
    }, [ownerId, email]);

    useEffect(() => {
        console.log('role', plan);
    }, [plan]);

    useEffect(() => {
        if (ownerId.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    const getDate = () => {
        const currentDate = new Date();
        return currentDate.toLocaleString();
    };
    const addPendingRestock = async (reqRestockProduct) => {
        if (plan !== '') {
            setLoading(true);
            const restockRef = doc(firestore, 'users', email);
            const restockCollection = collection(firestore, 'users');
            const q = query(restockCollection, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            let checkPending;
            querySnapshot.forEach((restockDoc) => {
                const pendingArr = restockDoc.data().pendingOrders;

                checkPending = pendingArr.filter((pending) => (pending.client === reqRestockProduct.client && pending.requestedProduct === reqRestockProduct.requestedProduct));
            });

            if (checkPending.length > 0) {
                setAlreadyAdded(true);
                setLoading(false);
                setTimeout(() => {
                    setAlreadyAdded(false);
                }, 3000);
            } else {
                await updateDoc(restockRef, { pendingOrders: arrayUnion(reqRestockProduct) });
                setTimeout(() => {
                    setLoading(false);
                    setSuccess(true);
                }, 1000);
            }
        }
    };

    if (gettingData) {
        return <Spin tip="Loading Data..." className={styles.submitSpinner} size="large" />;
    }

    const trimmedCustomerName = clientName.replace(' ', '%20');
    const fullMessage = `${product} Restock Requested For ${trimmedCustomerName}`;
    const trimmedMessage = fullMessage.replace(' ', '%20');

    return (
        <>
            <Header className={`${styles.title} ${styles.header}`}>
        LOGO HERE
            </Header>
            <Layout style={{ minHeight: '100vh' }}>
                <Content className={styles.requestContainer}>
                    {alreadyAdded ? <Alert message="Product Already Requested and In Process of Being Fulfilled." type="warning" /> : '' }
                    <div>You Are About To Request A Restock For The Following Product:</div>
                    <div className={styles.requestProduct}>{product}</div>
                    {/* on click, trigger email and send order to order status screen */}
                    {!gettingData && plan === '' ? <Button disabled>Plan Not Active. Please Contact Account Owner.</Button> : <Button type="primary" loading={loading} disabled={success || alreadyAdded ? true : ''} onClick={() => addPendingRestock({ uid: uuidv4(), dateAdded: getDate(), client: clientName, requestedProduct: product })}>{success ? 'Request Sent Successfully. You May Close This Page' : 'Request Restock'}</Button>}
                    {plan === 'silver' || plan === '' ? '' : <Button type="default" href={`sms:${repNumber}&body=${trimmedMessage}`}>Text Rep Directly</Button> }
                    <div className={styles.poweredBy}>
                        Powered By Supply Mate
                    </div>
                </Content>

            </Layout>
        </>
    );
}
