/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from 'react';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { Layout, Button, Modal } from 'antd';
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

    // make firebase call based on uid in url to get updated plan status

    const { Content, Header } = Layout;

    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        useEffect(() => {
            setProduct(urlParams.get('product'));
            setRepNumber(urlParams.get('rep'));
            setClientName(urlParams.get('clientName'));
            // setOwnerName(urlParams.get('ownerName'));
            setOwnerId(urlParams.get('id'));
        }, [urlParams]);
    }
    const getQuery = useCallback(async (ref) => {
        setGettingData(true);
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                // setPlan(document.data().plan);
                setEmail(document.data().email);

                querySubCollection('customers', 'email', '==', email, 'subscriptions').then((subCollection) => {
                    if (subCollection.length > 0) {
                        subCollection.forEach((sub) => {
                            if (sub.mostRecentSubDoc?.status === 'active') {
                                setPlan(sub.mostRecentSubDoc?.role);
                            }
                            setGettingData(false);
                        });
                    } else {
                        setGettingData(false);
                    }
                });
            }
        });
    }, [ownerId, email]);

    useEffect(() => {
        if (ownerId.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    const addPendingRestock = async (reqRestockProduct) => {
        setLoading(true);
        const restockRef = doc(firestore, 'users', email);

        await updateDoc(restockRef, { pendingOrders: arrayUnion(reqRestockProduct) });

        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1000);
    };

    const trimmedCustomerName = clientName.replace(' ', '%20');
    const fullMessage = `${product} Restock Requested For ${trimmedCustomerName}`;
    const trimmedMessage = fullMessage.replace(' ', '%20');

    return (
        <>
            <Header className={`${styles.title} ${styles.header}`}>
        LOGO HERE
            </Header>
            <Layout style={{ minHeight: '100vh' }}>
                {gettingData ? (
                    <Modal title="Plan Status" open centered="true" footer={null}>
                        <p>{plan === '' ? 'Plan Not Active. Please Contact Account Owner' : 'Loading...'}</p>
                    </Modal>
                ) : ''}
                <Content className={styles.requestContainer}>
                    <div>You Are About To Request A Restock For The Following Product:</div>
                    <div className={styles.requestProduct}>{product}</div>
                    {/* on click, trigger email and send order to order status screen */}
                    <Button type="primary" loading={loading} disabled={success ? true : ''} onClick={() => addPendingRestock({ client: clientName, requestedProduct: product })}>{success ? 'Request Sent Successfully. You May Close This Page' : 'Request Restock'}</Button>
                    {plan === 'silver' || plan === '' ? '' : <Button type="default" href={`sms:${repNumber}&body=${trimmedMessage}`}>Text Rep Directly</Button> }
                    <div className={styles.poweredBy}>
                        Powered By Supply Mate
                    </div>
                </Content>

            </Layout>
        </>
    );
}
