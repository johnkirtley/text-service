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

        // add product context, set info here like rep info
        // this could eliminate re render on product
        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                console.log('firebase owner', document.data());
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
        const restockRef = doc(firestore, 'users', email);

        await updateDoc(restockRef, { pendingOrders: arrayUnion(reqRestockProduct) });
    };

    return (
        <Content className={styles.loginContainer}>
            <div>You Are About To Request A Restock For The Following Product:</div>
            <div>{product}</div>
            {/* on click, trigger email and send order to order status screen */}
            <Button type="primary" onClick={() => addPendingRestock({ client: clientName, requestedProduct: product })}>Request Restock</Button>
            <Button type="default" disabled={plan !== 'premium' ? true : ''} onClick={sendText}>Text Rep Directly</Button>
        </Content>
    );
}
