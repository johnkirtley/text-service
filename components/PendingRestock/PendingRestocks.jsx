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

        // add product context, set info here like rep info
        // this could eliminate re render on product
        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                console.log('firebase pending orders', document.data().pendingOrders);
                setPendingRestocks(document.data().pendingOrders);
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

    const fulfillRestock = async (client, item) => {
        const restockRef = doc(firestore, 'users', email);
        const dataToRemove = {
            client: `${client}`,
            requestedProduct: `${item}`,
        };

        await updateDoc(restockRef, { pendingOrders: arrayRemove(dataToRemove) });

        const filtered = pendingRestocks.filter((order) => order.requestedProduct !== item);

        setPendingRestocks(filtered);
    };

    return (
        <Content>
            <p>Restock Status</p>
            <Space direction="vertical" size="large" />
            <div>
                {pendingRestocks && pendingRestocks.length > 0
                    ? pendingRestocks.map((item, idx) => (
                        <div key={idx} className={styles.restockItemContainer}>
                            <div>Client: {item.client}</div>
                            <div>Product: {item.requestedProduct}</div>
                            <Button type="primary" onClick={() => fulfillRestock(item.client, item.requestedProduct)}>Completed</Button>
                        </div>
                    )) : 'No Pending Restock Requests'}
            </div>
        </Content>
    );
}
