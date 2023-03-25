/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
    Layout, Menu, Alert, Modal, Button, Input,
} from 'antd';
import { LineChartOutlined, BarcodeOutlined, PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import {
    BusinessNameContext, CustomerContext, RepContext, ProductContext, OwnerIdContext,
} from '../Context/Context';
import { MetaHead, MainHeader, MainFooter } from '../components';
import MainView from '../components/Main/MainView';
import { firestore } from '../firebase/clientApp';
import { useAuth } from '../Context/AuthContext';
import usePremiumStatus from '../stripe/usePremiumStatus';

import { handleTextChange } from '../utils/helpers';

// Styles
import styles from '../styles/Home.module.css';

const defaultRep = {
    name: '',
    number: '',
};

export default function MainComponent() {
    const [view, setView] = useState('1');
    const { setCustomerInfo } = useContext(CustomerContext);
    const { businessName, setBusinessName } = useContext(BusinessNameContext);
    // const { authContext } = useContext(AuthContext);
    const { setRepInfo } = useContext(RepContext);
    const [newRep, setNewRep] = useState(defaultRep);
    const { setCurProducts } = useContext(ProductContext);
    const { setOwnerId } = useContext(OwnerIdContext);
    const { user, loading } = useAuth();
    const [newUserAlert, setNewUserAlert] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);
    const [disableWalkthroughButton, setDisableWalkthroughButton] = useState(true);
    const router = useRouter();

    const { planName } = usePremiumStatus(user);

    useEffect(() => {
        if (newRep.name.length < 1 || newRep.number.length < 1 || businessName.length < 1) {
            setDisableWalkthroughButton(true);
        } else {
            setDisableWalkthroughButton(false);
        }
    }, [newRep, businessName]);

    useEffect(() => {
        if (planName === '') {
            setNewUserAlert(true);
        }
    }, [planName]);

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('email', '==', user.email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        // add product context, set info here like rep info
        // this could eliminate re render on product
        querySnapshot.forEach((document) => {
            if (document.data().email === user.email) {
                const newArr = document.data().products.map((product) => ({ product, isChecked: false }));
                console.log('firebase query', document.data());
                setCustomerInfo(document.data());
                setBusinessName(document.data().businessName);
                setRepInfo(document.data().repNumbers);
                setCurProducts(newArr);
                setOwnerId(document.data().uid);
                setFirstLoad(document.data().firstLoad);
            }
        });
    }, [user, setCustomerInfo, setBusinessName, setRepInfo, setCurProducts, setOwnerId]);

    useEffect(() => {
        if (user) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [user, getQuery]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push('/login');
    }

    // if (user) {
    //     router.push('/');
    // }

    function getItem(label, key, icon, children) {
        return { key, icon, children, label };
    }

    const items = [
        getItem('Insights', '1', <LineChartOutlined />),
        getItem('Generate Codes', '2', <BarcodeOutlined />),
        getItem('Pending Restocks', '3', <PlusCircleOutlined />),
        getItem('Settings', '4', <SettingOutlined />),
    ];

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', user.email);

        console.log('bus', val);

        await updateDoc(nameUpdateRef, { businessName: val });
    };

    const handleRepChange = (e) => {
        setNewRep({
            ...newRep,
            [e.target.name]: e.target.value,
        });
    };

    const saveContact = async (rep) => {
        // backend api call to store phone number in DB
        const { number } = rep;

        console.log('rep', rep);

        const sanitizedNum = number.replace(/^(\+)|\D/g, '$1');

        const data = { ...rep, number: sanitizedNum };

        setNewRep(data);

        if (rep.length < 1) {
            alert('Enter Valid Phone Number');
        } else {
            const repAddRef = doc(firestore, 'users', user.email);

            await updateDoc(repAddRef, { repNumbers: arrayUnion(newRep) });

            setRepInfo((oldInfo) => [...oldInfo, newRep]);

            setNewRep(defaultRep);
        }
    };

    const completeWalkthrough = async (rep, business) => {
        saveContact(rep);
        saveBusinessName(business);

        const userRef = doc(firestore, 'users', user.email);

        await updateDoc(userRef, { firstLoad: false });

        setFirstLoad(false);
    };

    return (
        <div>
            {user === null ? '' : (
                <div>
                    <MainHeader companyName={businessName} />
                    <Layout style={{ minHeight: '100vh' }}>
                        <MetaHead />

                        <Menu
                            theme="light"
                            defaultSelectedKeys={['1']}
                            mode="horizontal"
                            items={items}
                            onSelect={(key) => setView(key.key)}
                            className={styles.navMenu}
                        />
                        {firstLoad ? (
                            <Modal title="Welcome To Supply Mate!" open={firstLoad} footer={null} centered closable={false}>
                                <div className={styles.newUserContainer}>
                                    <p className={styles.newUserHeader}>Let&apos;s Add Some Basic Info To Get Started</p>
                                    <div>
                                        <Input placeholder="Company Name..." value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                                        <p className={styles.newUserLabels}>This can be updated under Settings.</p>
                                    </div>
                                    <div className={styles.newUserRepInputContainer}>
                                        <p className={styles.newUserAddContactLabel}>Please Add Your First Contact.</p>
                                        <p className={styles.newUserLabels}>Contacts can be managed under Settings.</p>
                                        <div className={styles.newUserRepInputs}>
                                            <div>
                                                <Input placeholder="Name..." value={newRep.name} name="name" onChange={handleRepChange} />
                                            </div>
                                            <div>
                                                <Input placeholder="Phone Number..." value={newRep.number} name="number" onChange={handleRepChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <Button disabled={disableWalkthroughButton} type="primary" onClick={() => completeWalkthrough(newRep, businessName)}>Complete Setup</Button>
                                </div>
                            </Modal>
                        ) : ''}
                        {newUserAlert ? (
                            <div className={styles.signUpAlert}>
                                <Alert message="Head To Settings To Choose Your Plan Before Generating Codes &#128522;" type="info" showIcon />
                            </div>
                        ) : ''}
                        <MainView view={view} />
                    </Layout>
                    <MainFooter />
                </div>
            )}
        </div>

    );
}
