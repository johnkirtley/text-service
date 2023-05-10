/* eslint-disable sonarjs/no-redundant-jump */
/* eslint-disable max-len */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { Layout, Button, Spin, Alert } from 'antd';
import { uuidv4 } from '@firebase/util';
import axios from 'axios';
import logger from '../utils/logger';
import { firestore } from '../firebase/clientApp';
import usePremiumStatus from '../stripe/usePremiumStatus';

import styles from '../styles/Home.module.css';

export default function Submit() {
    const [product, setProduct] = useState('');
    const [repId, setRepId] = useState('');
    const [repText, setRepText] = useState('');
    const [clientName, setClientName] = useState('');
    // const [ownerName, setOwnerName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [plan, setPlan] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [gettingData, setGettingData] = useState(false);
    const [alreadyAdded, setAlreadyAdded] = useState(false);
    const [premiumSettings, setPremiumSettings] = useState(null);
    const [numAlert, setNumAlert] = useState(false);

    const { planName } = usePremiumStatus(email);

    useEffect(() => {
        setPlan(planName);
    }, [email, planName]);

    const { Content, Header } = Layout;

    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        useEffect(() => {
            setProduct(urlParams.get('product'));
            setRepId(urlParams.get('rep'));
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
                setPremiumSettings(document.data().premiumSettings);
                document.data().repNumbers.forEach((repNum) => {
                    if (repNum.id === repId) {
                        setRepText(repNum.number);
                    }
                });
                setTimeout(() => {
                    setGettingData(false);
                }, 1500);
            }
        });
    }, [ownerId, repId]);

    const getDate = () => {
        const currentDate = new Date();
        return currentDate.toLocaleString();
    };

    useEffect(() => {
        const addScan = async () => {
            if (plan !== '') {
                const addScanAnalytics = {
                    date: getDate(),
                    type: 'scan',
                    product,
                    client: clientName,
                };

                if (email !== '') {
                    const restockRef = doc(firestore, 'users', email);
                    await updateDoc(restockRef, { analytics: arrayUnion(addScanAnalytics) });
                }
            }
        };

        if (email !== '' && plan) {
            addScan();
        }
    }, [clientName, product, email, plan]);

    useEffect(() => {
        if (ownerId.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    const addPendingRestock = async (reqRestockProduct, message, num) => {
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
                const addAnalyticsRestock = {
                    date: getDate(),
                    type: 'restock',
                    product: reqRestockProduct.requestedProduct,
                    client: reqRestockProduct.client,
                };
                await updateDoc(restockRef, { pendingOrders: arrayUnion(reqRestockProduct) });
                await updateDoc(restockRef, { analytics: arrayUnion(addAnalyticsRestock) });

                logger('action', 'Restock Requested', { clientName });
                const data = {
                    message,
                    number: num,
                };

                setTimeout(() => {
                    setLoading(false);
                    setSuccess(true);
                }, 1000);

                // if (num.length < 1) {
                //     setNumAlert(true);
                //     setTimeout(() => {
                //         setNumAlert(false);
                //     }, 2500);
                //     return;
                // }

                // axios.post('https://text-service-mailer.herokuapp.com/api/code_submission/text', data)
                //     .then((res) => {
                //         console.log(res);
                //     })
                //     .catch((err) => console.log(err));
            }
        }
    };

    if (gettingData) {
        return <Spin tip="Loading Data..." className={styles.submitSpinner} size="large" />;
    }

    // const trimmedCustomerName = clientName.replace(' ', '%20');
    const fullMessage = `${product} Restock Requested For ${clientName}`;
    const trimmedMessage = fullMessage.replace(' ', '%20');

    const checkForRep = (num) => {
        if (num.length < 1) {
            setNumAlert(true);
            setTimeout(() => {
                setNumAlert(false);
            }, 2500);
            return;
        }

        logger('action', 'Direct Text Clicked', { client: clientName, owner: ownerId });
        window.location.href = `sms:${num}&body=${trimmedMessage}`;
    };

    return (
        <>
            <Header className={`${styles.title} ${styles.header}`}>
                <div className={styles.logoContainer}>
                    <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                    <p className={styles.logoText}>SUPPLY MATE</p>
                </div>
            </Header>
            <Layout style={{ minHeight: '90vh' }}>
                <Content className={styles.requestContainer}>
                    {alreadyAdded ? <Alert message="Product Already Requested and In Process of Being Fulfilled." type="warning" /> : '' }
                    {numAlert ? <Alert message="Number No Longer Active. Please Contact Owner." type="warning" /> : ''}
                    <div style={{ marginBottom: '6rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>You Are About To Request A Restock For:</div>
                        <div className={styles.requestProduct}>{product}</div>
                    </div>
                    {!gettingData && plan === '' ? <Button disabled style={{ fontSize: '1.25rem' }}>Plan Not Active. Please Contact Account Owner.</Button> : (
                        <Button
                            type="primary"
                            loading={loading}
                            disabled={success || alreadyAdded ? true : ''}
                            style={{ fontSize: '1.25rem' }}
                            onClick={() => addPendingRestock({ uid: uuidv4(), dateAdded: getDate(), client: clientName, requestedProduct: product }, fullMessage, repText)}
                        >{success ? 'Request Sent Successfully. You May Close This Page' : 'Request Restock'}
                        </Button>
                    )}
                    {plan === 'bronze' || plan === '' || !premiumSettings?.directText ? '' : <Button className={styles.textRep} style={{ fontSize: '1.25rem' }} type="default" onClick={() => checkForRep(repText)}>Text Rep Directly</Button> }
                    {/* <div className={styles.poweredBy}>
                        Powered By Supply Mate
                    </div> */}
                </Content>
            </Layout>
        </>
    );
}
