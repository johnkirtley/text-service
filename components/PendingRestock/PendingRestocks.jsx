/* eslint-disable max-len */
/* eslint-disable consistent-return */
import { useState, useEffect, useCallback, useContext } from 'react';
import {
    getDocs, collection, query, where, updateDoc, doc, getDoc,
} from 'firebase/firestore';
import {
    Layout, Space, Button, Tabs, Table, Spin, Input,
} from 'antd';

import { firestore } from '../../firebase/clientApp';

import styles from './PendingRestock.module.css';

import OwnerIdContext from '../../Context/OwnerIdContext';

export default function PendingRestocks() {
    const [pendingRestocks, setPendingRestocks] = useState([]);
    const [completedRestocks, setCompletedRestocks] = useState([]);
    const { ownerId } = useContext(OwnerIdContext);
    const [email, setEmail] = useState('');
    const [tabView, setTabView] = useState('1');
    const [loading, setLoading] = useState(false);
    const [searchCompleted, setSearchCompleted] = useState('');
    const [filteredRestocks, setFilteredRestocks] = useState([]);

    const { Content } = Layout;

    const handleSearchCompleted = (e) => {
        const searchValue = e.target.value;
        setSearchCompleted(searchValue);
    };

    useEffect(() => {
        const filtered = completedRestocks.filter((prod) => prod.client.toLowerCase().includes(searchCompleted.toLowerCase()) || prod.requestedProduct.toLowerCase().includes(searchCompleted.toLowerCase()) || prod.dateCompleted.includes(searchCompleted));

        if (searchCompleted.trim() === '') {
            setFilteredRestocks(completedRestocks);
        } else {
            setFilteredRestocks(filtered);
        }
    }, [completedRestocks, searchCompleted]);

    const getQuery = useCallback(async (ref) => {
        setLoading(true);
        const q = query(ref, where('uid', '==', ownerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((document) => {
            if (document.data().uid === ownerId) {
                const pendingArr = document.data().pendingOrders;
                const sortedPending = pendingArr.sort((a, b) => b.dateAdded - a.dateAdded);

                setPendingRestocks(sortedPending);

                console.log('pending', pendingRestocks);

                const arr = document.data().completedOrders;
                const sortedCompleted = arr.sort((a, b) => {
                    const dateA = new Date(a.dateCompleted);
                    const dateB = new Date(b.dateCompleted);

                    return dateB - dateA;
                });
                setCompletedRestocks(sortedCompleted);
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

    const getDate = () => {
        const currentDate = new Date();
        return currentDate.toLocaleString();
    };

    const addToCompleted = (data) => {
        const docRef = doc(firestore, 'users', email);
        const completedDate = getDate();

        console.log('completed', completedDate);
        const newObject = { ...data, dateCompleted: completedDate };

        getDoc(docRef).then((docSnapshot) => {
            const currentArray = docSnapshot.get('completedOrders') || [];

            const updatedArray = [...currentArray, newObject];

            setCompletedRestocks([newObject, ...completedRestocks]);

            return updateDoc(docRef, { completedOrders: updatedArray });
        }).then(() => {
            console.log('Completed!');
        }).catch((error) => {
            console.error('Error adding object to array:', error);
        });
    };

    const fulfillRestock = (uid, client, item) => {
        const restockRef = doc(firestore, 'users', email);
        const dataToRemove = {
            client: `${client}`,
            requestedProduct: `${item}`,
        };

        // await updateDoc(restockRef, { pendingOrders: arrayRemove(dataToRemove) });

        // const filtered = pendingRestocks.filter((order, idx) => idx !== id);

        getDoc(restockRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const currentArray = data.pendingOrders || [];

                const filteredArray = currentArray.filter((prod) => prod.uid !== uid);

                setPendingRestocks(filteredArray);
                addToCompleted(dataToRemove);
                return updateDoc(restockRef, { pendingOrders: filteredArray });
            }
        });
    };

    const tableColumns = [
        {
            title: 'Date Requested',
            dataIndex: 'dateAdded',
            key: 'dateAdded',

        },
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
                    <Button key={rowIndex} type="primary" onClick={() => fulfillRestock(record.uid, record.client, record.requestedProduct)}>Yes</Button>
                </Space>
            ),
        },

    ];

    const completedColumns = [
        {
            title: 'Completed On',
            dataIndex: 'dateCompleted',
            key: 'dateCompleted',

        },
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
        return <Spin tip="Loading Orders..." />;
    }

    return (
        <Content>
            <Space direction="vertical" size="large" />
            <div>
                <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange} />
                {tabView === '1' && pendingRestocks ? <Table bordered size="middle" columns={tableColumns} dataSource={pendingRestocks} className={styles.customTablePending} /> : ''}
                {tabView === '2' && completedRestocks ? (
                    <> <Input placeholder="Search Completed Orders..." name="searchCompleted" onChange={handleSearchCompleted} type="text" value={searchCompleted} className={styles.filterCompleted} />
                        <Table bordered size="middle" columns={completedColumns} dataSource={filteredRestocks} className={styles.customTableCompleted} />
                    </>
                ) : ''}
            </div>
        </Content>
    );
}
