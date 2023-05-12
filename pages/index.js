/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Layout, Menu, Modal, Button, Input, Steps, Checkbox, Badge,
} from 'antd';
import { LineChartOutlined, BarcodeOutlined, SettingOutlined } from '@ant-design/icons';
import {
    getDocs, collection, query, where, doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
    BusinessNameContext, CustomerContext, RepContext, ProductContext, OwnerIdContext, PremiumSettingsContext, PendingContext,
} from '../Context/Context';
import { MetaHead, MainHeader, MainFooter, Tutorial } from '../components';
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
    const [checkBox, setCheckbox] = useState(false);
    // const { authContext } = useContext(AuthContext);
    const { setRepInfo } = useContext(RepContext);
    const { setPremiumContext } = useContext(PremiumSettingsContext);
    const [newRep, setNewRep] = useState(defaultRep);
    const [getStarted, setGetStarted] = useState(0);
    const { pendingRestocks, setPendingRestocks } = useContext(PendingContext);
    const [showTutorial, setShowTutorial] = useState(false);
    const { setCurProducts } = useContext(ProductContext);
    const { setOwnerId } = useContext(OwnerIdContext);
    const { user, loading } = useAuth();
    const [newUserAlert, setNewUserAlert] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);
    const [disableWalkthroughButton, setDisableWalkthroughButton] = useState(true);
    const router = useRouter();

    const { planName } = usePremiumStatus(user?.email);

    const next = () => {
        setGetStarted(getStarted + 1);
    };

    const prev = () => {
        setGetStarted(getStarted - 1);
    };

    useEffect(() => {
        if (newRep.name.length < 1 || newRep.number.length < 1 || businessName.length < 1 || !checkBox) {
            setDisableWalkthroughButton(true);
        } else {
            setDisableWalkthroughButton(false);
        }
    }, [newRep, businessName, checkBox]);

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
                setCustomerInfo(document.data());
                setBusinessName(document.data().businessName);
                setRepInfo(document.data().repNumbers);
                setCurProducts(newArr);
                setOwnerId(document.data().uid);
                setFirstLoad(document.data().firstLoad);
                setPremiumContext(document.data().premiumSettings);

                const pendingArr = document.data().pendingOrders;
                const sortedPending = pendingArr.sort((a, b) => b.dateAdded - a.dateAdded);

                setPendingRestocks(sortedPending);
            }
        });
    }, [user, setCustomerInfo, setBusinessName, setRepInfo, setCurProducts, setOwnerId, setPremiumContext, setPendingRestocks]);

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

    function getItem(label, key, icon, children) {
        return { key, icon, children, label };
    }

    const items = [
        getItem('Generate Codes', '1', <BarcodeOutlined />),
        getItem('Pending Restocks', '2', <Badge count={pendingRestocks.length} showZero />),
        getItem('Insights', '3', <LineChartOutlined />),
        getItem('Settings', '4', <SettingOutlined />),
    ];

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', user.email);

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

        const sanitizedNum = number.replace(/^(\+)|\D/g, '$1');

        const data = { ...rep, number: sanitizedNum, id: uuidv4() };

        setNewRep(data);

        if (rep.length < 1) {
            alert('Enter Valid Phone Number');
        } else {
            const repAddRef = doc(firestore, 'users', user.email);

            await updateDoc(repAddRef, { repNumbers: arrayUnion(data) });

            setRepInfo((oldInfo) => [...oldInfo, data]);

            setNewRep(defaultRep);
        }
    };

    const completeWalkthrough = async (rep, business) => {
        const checkNumLength = rep.number.replace(/\D/g, '');

        if (checkNumLength.length < 1) {
            alert('Invalid Number');
            return;
        }

        saveContact(rep);
        saveBusinessName(business);

        const userRef = doc(firestore, 'users', user.email);

        await updateDoc(userRef, { firstLoad: false });

        setFirstLoad(false);
        setShowTutorial(true);
    };

    const steps = [
        { title: 'Business Name' },
        { title: 'Add First Contact' },
    ];

    const checkBoxChange = (e) => {
        setCheckbox(e.target.checked);
    };

    return (
        <div>
            {user === null ? '' : (
                <div>
                    <div style={{ position: 'sticky', top: '0', zIndex: '9999' }}>
                        <MainHeader companyName={businessName} />
                        <Menu
                            theme="light"
                            defaultSelectedKeys={['1']}
                            mode="horizontal"
                            items={items}
                            onSelect={(key) => setView(key.key)}
                            className={styles.navMenu}
                        />
                    </div>
                    <Layout style={{ minHeight: '100vh' }}>
                        <MetaHead />
                        {firstLoad ? (
                            <Modal title="Welcome To Supply Mate!" open={firstLoad} footer={null} centered closable={false}>
                                <Steps current={getStarted} className={styles.stepsGetStarted}>
                                    {steps.map((step, index) => (
                                        <Steps.Step key={index} title={step.title} />
                                    ))}
                                </Steps>
                                <div className={styles.newUserContainer}>
                                    {getStarted === 0 ? (
                                        <>
                                            <div>
                                                <Input maxLength={40} placeholder="Your Business Name..." value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                                                <p className={styles.newUserLabels}>This can be updated under Settings.</p>
                                            </div>
                                            <div className={styles.prevNextButtons}>
                                                <Button disabled={businessName.length < 1} onClick={next}>Next</Button>
                                            </div>
                                        </>
                                    ) : ''}
                                    {getStarted === 1 ? (
                                        <>
                                            <div className={styles.newUserRepInputContainer}>
                                                <p className={styles.newUserLabels} style={{ marginBottom: '0', textAlign: 'center' }}>This name and number can be linked to your QR Codes to receive restock notifications.</p>
                                                <p className={styles.newUserLabels} style={{ textAlign: 'center' }}>Additional contacts can be managed under Settings.</p>
                                                <div className={styles.newUserRepInputs}>
                                                    <div>
                                                        <Input maxLength={40} placeholder="Name..." value={newRep.name} name="name" onChange={handleRepChange} />
                                                    </div>
                                                    <div>
                                                        <Input maxLength={40} placeholder="Phone Number..." value={newRep.number} name="number" onChange={handleRepChange} />
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem', marginTop: '1rem',
                                                }}
                                                >
                                                    <Checkbox onChange={checkBoxChange} />
                                                    <p style={{ fontSize: '.75rem' }}>I authorize Supply Mate for restock-related SMS alerts. <br /> Msg/data rates apply.</p>
                                                </div>
                                            </div>
                                            <div className={styles.prevNextButtons}>
                                                <Button onClick={prev}>Prev</Button>
                                                <Button disabled={disableWalkthroughButton} type="primary" onClick={() => completeWalkthrough(newRep, businessName)}>Complete Setup</Button>
                                            </div>
                                        </>
                                    ) : ''}

                                </div>
                            </Modal>
                        ) : ''}

                        {newUserAlert ? (
                            <div className={styles.signUpAlert}>
                                <div className="ant-alert ant-alert-info" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <span role="img" aria-label="info-circle" className="anticon anticon-info-circle ant-alert-icon"><svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" /></svg></span>
                                    <p style={{ margin: '0' }}>Please <Link href="plans" style={{ color: 'var(--primary-green)', textDecoration: 'underline' }}>Choose a Plan </Link>To Activate Generated Codes &#128522;</p>
                                </div>
                            </div>
                        ) : ''}
                        <MainView view={view} setShowTutorial={setShowTutorial} />
                        <Tutorial showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
                    </Layout>
                    <MainFooter />
                </div>
            )}
        </div>

    );
}
