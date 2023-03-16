/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from 'react';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { Layout, Button } from 'antd';
import { firestore } from '../firebase/clientApp';
import styles from '../styles/Home.module.css';

export default function Submit() {
    const [product, setProduct] = useState('');
    // const [repNumber, setRepNumber] = useState('');
    const [clientName, setClientName] = useState('');
    // const [ownerName, setOwnerName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [plan, setPlan] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { Content } = Layout;

    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        useEffect(() => {
            setProduct(urlParams.get('product'));
            // setRepNumber(urlParams.get('rep'));
            setClientName(urlParams.get('clientName'));
            // setOwnerName(urlParams.get('ownerName'));
            setOwnerId(urlParams.get('id'));
        }, [urlParams]);
    }

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                setPlan(document.data().plan);
                setEmail(document.data().email);
            }
        });
    }, [ownerId]);

    useEffect(() => {
        if (ownerId.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    const sendText = () => {
        // send text to owner if clicked
        console.log('text sent');
    };

    const addPendingRestock = async (reqRestockProduct) => {
        setLoading(true);
        const restockRef = doc(firestore, 'users', email);

        await updateDoc(restockRef, { pendingOrders: arrayUnion(reqRestockProduct) });

        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1000);
    };

    return (
        <Content className={styles.requestContainer}>
            <div>You Are About To Request A Restock For The Following Product:</div>
            <div className={styles.requestProduct}>{product}</div>
            {/* on click, trigger email and send order to order status screen */}
            <Button type="primary" loading={loading} disabled={success ? 'true' : ''} onClick={() => addPendingRestock({ client: clientName, requestedProduct: product })}>{success ? 'Request Sent Successfully. You May Close This Page' : 'Request Restock'}</Button>
            {plan !== 'premium' ? '' : <Button type="default" onClick={sendText}>Text Rep Directly</Button> }
        </Content>
    );
}
