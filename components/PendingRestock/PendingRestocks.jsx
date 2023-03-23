import { useState, useEffect, useCallback, useContext } from 'react';
import {
    getDocs, collection, query, where, updateDoc, arrayRemove, doc,
} from 'firebase/firestore';
import {
    Layout, Space, Button, Tabs, Table, Spin,
} from 'antd';

import { firestore } from '../../firebase/clientApp';

import styles from './PendingRestock.module.css';

import OwnerIdContext from '../../Context/OwnerIdContext';

export default function PendingRestocks() {
    const [pendingRestocks, setPendingRestocks] = useState([]);
    const { ownerId } = useContext(OwnerIdContext);
    const [email, setEmail] = useState('');
    const [tabView, setTabView] = useState('1');
    const [loading, setLoading] = useState(false);

    const { Content } = Layout;

    const getQuery = useCallback(async (ref) => {
        setLoading(true);
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                setPendingRestocks(document.data().pendingOrders);
                setEmail(document.data().email);
            }
        });
        setTimeout(() => {
            setLoading(false);
        }, 750);
    }, [ownerId]);

    useEffect(() => {
        if (ownerId.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    const fulfillRestock = async (client, item, id) => {
        console.log('id', id);
        const restockRef = doc(firestore, 'users', email);
        const dataToRemove = {
            client: `${client}`,
            requestedProduct: `${item}`,
        };

        await updateDoc(restockRef, { pendingOrders: arrayRemove(dataToRemove) });

        const filtered = pendingRestocks.filter((order, idx) => idx !== id);

        setPendingRestocks(filtered);
    };

    const tableColumns = [
        {
            title: 'Client/Location',
            dataIndex: 'client',
            key: 'client',

        },
        {
            title: 'Requested Product',
            dataIndex: 'requestedProduct',
            key: 'requestedProduct',
        },
        {
            title: 'Fulfilled',
            key: 'action',
            render: (_, record, rowIndex) => (
                <Space size="middle">
                    <Button key={rowIndex} type="primary" onClick={() => fulfillRestock(record.client, record.requestedProduct, rowIndex)}>Yes</Button>
                </Space>
            ),
        },

    ];

    const onTabChange = (key) => {
        setTabView(key);
    };

    const tabItems = [
        {
            key: '1',
            label: 'Pending',
        },
        {
            key: '2',
            label: 'Completed',
        },
    ];

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    return (
        <Content>
            <Space direction="vertical" size="large" />
            <div>
                <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange} />
                {tabView === '1' && pendingRestocks ? <Table bordered size="middle" columns={tableColumns} dataSource={pendingRestocks} className={styles.customTable} /> : ''}
                {tabView === '2' && pendingRestocks ? <Table bordered size="middle" columns={tableColumns} dataSource={pendingRestocks} className={styles.customTable} /> : ''}
            </div>
        </Content>
    );
}
