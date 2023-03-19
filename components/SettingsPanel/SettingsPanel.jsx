import { useContext, useState } from 'react';
import Link from 'next/link';
import {
    Layout, Input, Button, Space, Alert, Card, Collapse,
} from 'antd';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { RepContext, BusinessNameContext, AuthContext } from '../../Context/Context';
import { firestore } from '../../firebase/clientApp';
import createCheckoutSession from '../../stripe/createCheckoutSession';
import usePremiumStatus from '../../stripe/usePremiumStatus';

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
    const { authContext } = useContext(AuthContext);
    const [newRep, setNewRep] = useState(defaultRep);
    const [displayAlert, setDisplayAlert] = useState(false);
    const [planClicked, setPlanClicked] = useState(false);
    const isUserPremium = usePremiumStatus(authContext);

    const plans = ['silver', 'bronze', 'gold'];

    const { Panel } = Collapse;

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', authContext.email);

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

    const saveContact = async (rep) => {
        // backend api call to store phone number in DB
        const { number } = rep;

        const sanitizedNum = number.replace(/^(\+)|\D/g, '$1');

        const data = { ...rep, number: sanitizedNum };

        setNewRep(data);

        if (rep.length < 1) {
            alert('Enter Valid Phone Number');
        } else {
            const repAddRef = doc(firestore, 'users', authContext.email);

            await updateDoc(repAddRef, { repNumbers: arrayUnion(newRep) });

            setRepInfo((oldInfo) => [...oldInfo, newRep]);

            setNewRep(defaultRep);
        }
    };

    const removeRep = async (name, num) => {
        const repAddRef = doc(firestore, 'users', authContext.email);
        const dataToRemove = {
            name: `${name}`,
            number: `${num}`,
        };

        await updateDoc(repAddRef, { repNumbers: arrayRemove(dataToRemove) });

        const filtered = repInfo.filter((rep) => rep.number !== num);

        setRepInfo(filtered);
        setNewRep(defaultRep);
    };

    const handleBilling = (planType) => {
        setPlanClicked(true);
        createCheckoutSession(authContext.uid, planType);
    };

    return (
        <div>
            {displayAlert ? <Alert message="Business name updated" type="success" className={styles.successAlert} /> : ''}

            <Layout>
                <Space className={styles.settingsContainer}>
                    <Space className={styles.businessInput}>
                        <Card title="Business Name">
                            <Input placeholder="Company Name" value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                            <Button type="primary" onClick={() => saveBusinessName(businessName)}>Save</Button>
                        </Card>
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
                                    {repInfo && repInfo.length > 0
                                        ? repInfo.map((num, idx) => (
                                            <div
                                                className={styles.repContainer}
                                                key={idx}
                                            >
                                                <p className={styles.repName}>{num?.name}</p>

                                                <p className={styles.repInfo}>
                                                    <div className={styles.repBold}>
                                                    Phone Number:
                                                    </div>
                                                    <span>{num?.number}</span>
                                                </p>
                                                <Button type="primary" danger onClick={() => removeRep(num?.name, num?.number)}>Remove</Button>
                                            </div>
                                        )) : <div><p>No Reps Found. Please Add One.</p></div>}
                                </Panel>
                            </Collapse>
                        </div>
                    </Space>
                    <Collapse>
                        <Panel header="Manage Billing">
                            <Space className={styles.billingContainer}>

                                <div className={styles.currentPlan}>
                            Current Plan: {isUserPremium.planName}
                                </div>
                                {planClicked ? <Button type="primary" loading>Redirecting To Stripe...</Button>
                                    : (
                                        <div className={styles.plans}>
                                            {plans.map((plan, idx) => (
                                                isUserPremium.planName === plan ? <Button type="primary" key={idx} className={styles.planButton} disabled>Current Plan</Button>
                                                    : <Button type="primary" key={idx} className={styles.planButton} onClick={() => handleBilling(plan)}>Select {plan} Plan</Button>
                                            ))}

                                        </div>
                                    )}
                                <Space>
                                    <div className={styles.viewPlansLink}>
                                        <Link href="/plans">View Plans Page</Link>
                                    </div>
                                </Space>
                            </Space>
                        </Panel>
                    </Collapse>
                </Space>

            </Layout>
        </div>
    );
}
