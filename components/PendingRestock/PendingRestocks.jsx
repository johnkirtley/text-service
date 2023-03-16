import { useState, useEffect, useCallback, useContext } from 'react';
import {
    getDocs, collection, query, where, updateDoc, arrayRemove, doc,
} from 'firebase/firestore';
import { Layout, Space, Button } from 'antd';
import { firestore } from '../../firebase/clientApp';

import styles from './PendingRestock.module.css';

import OwnerIdContext from '../../Context/OwnerIdContext';

export default function PendingRestocks() {
    const [pendingRestocks, setPendingRestocks] = useState([]);
    const { ownerId } = useContext(OwnerIdContext);
    const [email, setEmail] = useState('');

    const { Content } = Layout;

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                setPendingRestocks(document.data().pendingOrders);
                console.log(pendingRestocks);
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

    const fulfillRestock = async (client, item, id) => {
        const restockRef = doc(firestore, 'users', email);
        const dataToRemove = {
            client: `${client}`,
            requestedProduct: `${item}`,
        };

        await updateDoc(restockRef, { pendingOrders: arrayRemove(dataToRemove) });

        const filtered = pendingRestocks.filter((order, idx) => idx !== id);

        console.log('filter', filtered);

        setPendingRestocks(filtered);
    };

    return (
        <Content>
            <Space direction="vertical" size="large" />
            <div>
                {pendingRestocks && pendingRestocks.length > 0
                    ? pendingRestocks.map((item, idx) => (
                        <div key={idx} className={styles.restockItemContainer}>
                            <div>Client: {item.client}</div>
                            <div>Product: {item.requestedProduct}</div>
                            <Button type="primary" onClick={() => fulfillRestock(item.client, item.requestedProduct, idx)}>Completed</Button>
                        </div>
                    )) : 'No Pending Restock Requests'}
            </div>
        </Content>
    );
}
