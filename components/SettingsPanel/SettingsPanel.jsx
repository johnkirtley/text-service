/* eslint-disable max-len */
import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Layout, Input, Button, Space, Alert, Card, Collapse, Modal,
} from 'antd';
import {
    doc, updateDoc, arrayUnion, arrayRemove, deleteDoc,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { RepContext, BusinessNameContext } from '../../Context/Context';
import { firestore } from '../../firebase/clientApp';
// import createCheckoutSession from '../../stripe/createCheckoutSession';
import usePremiumStatus from '../../stripe/usePremiumStatus';
import { useAuth } from '../../Context/AuthContext';
import generatePortal from '../../stripe/createPortal';

// Helper Functions
import { handleTextChange } from '../../utils/helpers';

// styles
import styles from './Settings.module.css';

const defaultRep = {
    name: '',
    number: '',
};

export default function SettingsPanel() {
    const { repInfo, setRepInfo } = useContext(RepContext);
    // const { customerInfo } = useContext(CustomerContext);
    const { businessName, setBusinessName } = useContext(BusinessNameContext);
    const [newRep, setNewRep] = useState(defaultRep);
    const [displayAlert, setDisplayAlert] = useState(false);
    // const [planClicked, setPlanClicked] = useState(false);
    const [searchRep, setSearchRep] = useState('');
    const [filteredSearch, setFilteredSearch] = useState(repInfo);
    const [accountDeleteModal, setAccountDeleteModal] = useState(false);
    const [customerPortal, setCustomerPortal] = useState(false);
    const { user } = useAuth();
    const isUserPremium = usePremiumStatus(user);

    // const plans = ['silver', 'bronze', 'gold'];

    const { Panel } = Collapse;

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', user.email);

        await updateDoc(nameUpdateRef, { businessName: val });

        setDisplayAlert(true);

        setTimeout(() => {
            setDisplayAlert(false);
        }, 3000);
    };

    const handleRepChange = (e) => {
        setNewRep({
            ...newRep,
            [e.target.name]: e.target.value,
        });
    };

    const handleRepSearch = (e) => {
        const searchValue = e.target.value;
        setSearchRep(searchValue);
    };

    useEffect(() => {
        const filtered = repInfo.filter((rep) => rep.name.toLowerCase().includes(searchRep.toLowerCase())
        || rep.number.includes(searchRep));

        if (searchRep.trim() === '') {
            setFilteredSearch(repInfo);
        } else {
            setFilteredSearch(filtered);
        }
    }, [repInfo, searchRep]);

    const saveContact = async (rep) => {
        // backend api call to store phone number in DB
        const { number } = rep;

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

    const removeRep = async (name, num) => {
        const repAddRef = doc(firestore, 'users', user.email);
        const dataToRemove = {
            name: `${name}`,
            number: `${num}`,
        };

        await updateDoc(repAddRef, { repNumbers: arrayRemove(dataToRemove) });

        const filtered = repInfo.filter((rep) => rep.number !== num);

        setRepInfo(filtered);
        setNewRep(defaultRep);
    };

    // const handleBilling = (planType) => {
    //     setPlanClicked(true);
    //     createCheckoutSession(user.uid, planType);
    // };

    const confirmAccountDelete = async () => {
        setAccountDeleteModal(true);
    };

    const handleDelete = () => {
        if (user) {
            const userRef = doc(firestore, 'users', user.email);
            deleteDoc(userRef).then(() => deleteUser(user));
        }
    };

    const handleManageBilling = () => {
        setCustomerPortal(true);
        generatePortal();
    };

    return (
        <div>
            {displayAlert ? <Alert message="Business name updated" type="success" className={styles.successAlert} /> : ''}

            <Layout>
                <Modal centered title="Account Delete Confirmation" open={accountDeleteModal} onOk={handleDelete} onCancel={() => setAccountDeleteModal(false)}>
                Are You Sure You Want To Delete Your Account?
                </Modal>
                <Space className={styles.settingsContainer}>
                    <Space className={styles.businessInput}>
                        <Collapse defaultActiveKey={1}>
                            <Panel header="Business Name" key={1}>
                                <div className={styles.businessNameContainer}>
                                    <Input placeholder="Company Name" value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                                    <Button type="primary" onClick={() => saveBusinessName(businessName)}>Update</Button>
                                </div>
                            </Panel>
                        </Collapse>
                    </Space>
                    <Space className={styles.repListContainer}>
                        <Card title="Add Reps">
                            <div className={styles.repInputBox}>
                                <div>
                                    <p>Name</p>
                                    <Input placeholder="Enter Rep Name" value={newRep.name} name="name" onChange={handleRepChange} />
                                </div>
                                <div>
                                    <p>Phone Number</p>
                                    <Input placeholder="Enter Rep Number" value={newRep.number} name="number" onChange={handleRepChange} />
                                </div>
                                <Button type="primary" onClick={() => saveContact(newRep)}>Add</Button>
                            </div>
                        </Card>
                        {/* input to add additional reps to contact list
                        iterate and show all added reps + numbers */}
                        <div>
                            <Collapse>
                                <Panel header="List of Current Reps">
                                    <div className={styles.repScroll}>
                                        <Input placeholder="Search Reps..." value={searchRep} name="repSearch" onChange={handleRepSearch} className={styles.searchRepsInput} />
                                        {filteredSearch && filteredSearch.length > 0
                                            ? filteredSearch.map((num, idx) => (
                                                <div
                                                    className={styles.repContainer}
                                                    key={idx}
                                                >
                                                    <p className={styles.repName}>{num?.name}</p>

                                                    <div className={styles.repInfo}>
                                                        <p className={styles.repBold}>
                                                    Phone Number:
                                                        </p>
                                                        <p>{num?.number}</p>
                                                    </div>
                                                    <Button type="primary" danger onClick={() => removeRep(num?.name, num?.number)}>Remove</Button>
                                                </div>
                                            )) : <div><p>No Reps Found. Please Add One.</p></div>}
                                    </div>

                                </Panel>
                            </Collapse>
                        </div>
                    </Space>
                    <Collapse>
                        <Panel header="Manage Plan">
                            <Space className={styles.billingContainer}>

                                <div className={styles.currentPlan}>
                            Current Plan: {isUserPremium.planName || 'No Active Plan'}
                                </div>
                                {/* {planClicked ? <Button type="primary" loading>Redirecting To Stripe...</Button>
                                    : (
                                        <div className={styles.plans}>
                                            {plans.map((plan, idx) => (
                                                isUserPremium.planName === plan ? <Button type="primary" key={idx} className={styles.planButton} disabled>Current Plan</Button>
                                                    : <Button type="primary" key={idx} className={styles.planButton} onClick={() => handleBilling(plan)}>Select {plan} Plan</Button>
                                            ))}

                                        </div>
                                    )} */}
                                <Space>
                                    <Button className={styles.viewPlansLink}>
                                        <Link href="/plans">Upgrade Plan</Link>
                                    </Button>
                                </Space>
                                {isUserPremium.planName === '' ? '' : (
                                    <Button onClick={handleManageBilling}>
                                        {customerPortal ? 'Redirecting To Customer Portal...' : 'Manage Subscription'}
                                    </Button>
                                ) }
                                <Button onClick={confirmAccountDelete} className={styles.deleteButton}>
                        Delete Account
                                </Button>
                            </Space>
                        </Panel>
                    </Collapse>
                </Space>

            </Layout>
        </div>
    );
}
