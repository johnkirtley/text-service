/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-len */
import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Layout, Input, Button, Space, Alert, Card, Collapse, Modal, Form,
} from 'antd';
import {
    doc, updateDoc, arrayUnion, arrayRemove, deleteDoc,
} from 'firebase/firestore';
import { deleteUser, signOut, updatePassword } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { usePostHog } from 'posthog-js/react';
import { RepContext, BusinessNameContext, PremiumSettingsContext } from '../../Context/Context';
import { firestore, firebaseAuth } from '../../firebase/clientApp';
// import logger from '../../utils/logger';
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

const credentials = {
    changePassword: '',
    confirmPassword: '',
};

export default function SettingsPanel({ setShowTutorial }) {
    const { repInfo, setRepInfo } = useContext(RepContext);
    // const { customerInfo } = useContext(CustomerContext);
    const { businessName, setBusinessName } = useContext(BusinessNameContext);
    const [newRep, setNewRep] = useState(defaultRep);
    const [displayAlert, setDisplayAlert] = useState(false);
    const [contactAdded, setContactAdded] = useState(false);
    const [changePassword, setChangePassword] = useState(credentials);
    const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);
    const [passwordMatchInvalid, setPasswordMatchInvalid] = useState(false);
    const [invalidLength, setInvalidLength] = useState(false);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState(false);
    const [showReAuthModal, setShowReAuthModal] = useState(false);
    // const [planClicked, setPlanClicked] = useState(false);
    const [searchRep, setSearchRep] = useState('');
    const [filteredSearch, setFilteredSearch] = useState(repInfo);
    const [accountDeleteModal, setAccountDeleteModal] = useState(false);
    const [customerPortal, setCustomerPortal] = useState(false);
    const [contactAlert, setContactAlert] = useState(false);
    const [dupeNum, setDupeNum] = useState(false);
    const [updateSetting, setUpdateSetting] = useState(false);
    const [disableAddRep, setDisableAddRep] = useState(true);
    // const [premiumSettings, setPremiumSettings] = useState(defaultPremiumSettings);
    const { premiumContext, setPremiumContext } = useContext(PremiumSettingsContext);
    const { user } = useAuth();
    const posthog = usePostHog();
    const isUserPremium = usePremiumStatus(user.email);

    const { Panel } = Collapse;

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', user.email);

        await updateDoc(nameUpdateRef, { businessName: val });

        posthog.capture('Updated Business Name', { user: user.email });

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

    async function getCustomer(email) {
        const response = await fetch('/api/get-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        return response.json();
    }

    const deleteStripeUser = async (email) => {
        const customerData = await getCustomer(email);
        const customerId = customerData.customer.data[0]?.id;

        const response = await fetch('/api/delete-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId }),
        });

        const data = await response.json();
        posthog.capture('User Deleted Account', { email });
        console.log('Customer Deleted:', data);
        return data;
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

        const sanitizedNum = number.replace(/\D/g, '');

        const data = { ...rep, number: sanitizedNum, id: uuidv4() };

        const checkDupeNumbers = repInfo.filter((num) => num.number.replace(/\D/g, '') === sanitizedNum);
        const checkNumLength = data.number.replace(/\D/g, '');

        if (checkNumLength.length < 1) {
            alert('Invalid Number');
            return;
        }

        if (checkDupeNumbers.length > 0) {
            setDupeNum(true);
            setTimeout(() => {
                setDupeNum(false);
            }, 2000);
            return;
        }

        setNewRep(data);

        if (rep.length < 1) {
            alert('Enter Valid Phone Number');
        } else {
            const repAddRef = doc(firestore, 'users', user.email);

            await updateDoc(repAddRef, { repNumbers: arrayUnion(data) });
            setContactAdded(true);

            setTimeout(() => {
                setContactAdded(false);
            }, 1500);
            posthog.capture('New Contact Added', { user: user.email });
            setRepInfo((oldInfo) => [...oldInfo, data]);

            setNewRep(defaultRep);
        }
    };

    const handleContactDelete = async (ref, data, num) => {
        await updateDoc(ref, { repNumbers: arrayRemove(data) });

        posthog.capture('User Deleted Contact', { user: user.email });
        const filtered = repInfo.filter((rep) => rep.number !== num);

        setRepInfo(filtered);
        setNewRep(defaultRep);
    };

    const removeRep = async (name, num, id) => {
        const repAddRef = doc(firestore, 'users', user.email);
        const dataToRemove = {
            name: `${name}`,
            number: `${num}`,
            id: `${id}`,
        };

        if (repInfo.length === 1) {
            setContactAlert(true);
            setTimeout(() => {
                setContactAlert(false);
            }, 1500);
            return;
        }

        Modal.confirm({
            title: 'Contact Delete Confirmation',
            content: <div><p>Warning: If this contact is connected to any active QR Codes, you must regenerate new codes with an existing contact to continue receiving mobile alerts for those products.</p><br /><p>Confirming Deletion of: <b>{name}</b></p></div>,
            okText: 'Delete',
            okType: 'primary',
            cancelText: 'Cancel',
            onOk() {
                handleContactDelete(repAddRef, dataToRemove, num);
            },
        });
    };

    const confirmAccountDelete = async () => {
        setAccountDeleteModal(true);
    };

    const handleDelete = async () => {
        if (user) {
            const userRef = doc(firestore, 'users', user.email);
            const storeEmail = user.email;
            deleteDoc(userRef).then(() => {
                deleteUser(user).then(() => {
                    deleteStripeUser(storeEmail);
                })
                    .catch((error) => {
                        if (error.message.includes('auth/requires-recent-login')) {
                            console.log('error', error.message);
                            posthog.capture('Reauth Required For Account Delete', { email: storeEmail });
                            setShowReAuthModal(true);
                            setAccountDeleteModal(false);
                        }
                    });
            });
        }
    };

    const handleManageBilling = () => {
        setCustomerPortal(true);
        posthog.capture('Manage Billing From Settings', { user: user.email });
        generatePortal(user.email);
    };

    useEffect(() => {
        if (newRep.name.length < 1 || newRep.number.length < 1) {
            setDisableAddRep(true);
        } else {
            setDisableAddRep(false);
        }
    }, [newRep]);

    const handlePremiumSettingsToggle = async (setting, state) => {
        const premiumSettingsRef = doc(firestore, 'users', user.email);
        setUpdateSetting(true);
        if (setting === 'directText') {
            if (state === 'enable') {
                const newObj = { ...premiumContext, directText: true };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });
                posthog.capture('User Turned Direct Text On', { user: user.email });
                setPremiumContext(newObj);
            }

            if (state === 'disable') {
                const newObj = { ...premiumContext, directText: false };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });
                posthog.capture('User Turned Direct Text Off', { user: user.email });
                setPremiumContext(newObj);
            }
        }

        if (setting === 'pendingEmails') {
            if (state === 'enable') {
                const newObj = { ...premiumContext, pendingEmails: true };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });

                setPremiumContext(newObj);
            }

            if (state === 'disable') {
                const newObj = { ...premiumContext, pendingEmails: false };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });

                setPremiumContext(newObj);
            }
        }

        if (setting === 'monthlyEmails') {
            if (state === 'enable') {
                const newObj = { ...premiumContext, monthlyEmails: true };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });

                setPremiumContext(newObj);
            }

            if (state === 'disable') {
                const newObj = { ...premiumContext, monthlyEmails: false };
                await updateDoc(premiumSettingsRef, { premiumSettings: newObj });
                setPremiumContext(newObj);
            }
        }

        setTimeout(() => {
            setUpdateSetting(false);
        }, 1200);
    };

    const handlePasswordChange = (e) => {
        setChangePassword({
            ...changePassword,
            [e.target.name]: e.target.value,
        });
    };

    const submitChangePassword = () => {
        if (changePassword.changePassword !== changePassword.confirmPassword) {
            setPasswordMatchInvalid(true);

            setTimeout(() => {
                setPasswordMatchInvalid(false);
            }, 2000);
            return;
        }

        if (changePassword.changePassword.length < 6) {
            setInvalidLength(true);

            setTimeout(() => {
                setInvalidLength(false);
            }, 2000);
            return;
        }
        setChangePasswordSubmitting(true);

        updatePassword(user, changePassword.changePassword).then(() => {
            setPasswordChangeSuccess(true);
            setChangePasswordSubmitting(false);
            posthog.capture('User Updated Password', { user: user.email });
            setTimeout(() => {
                setPasswordChangeSuccess(false);
            }, 1000);
        }).catch((error) => {
            setChangePasswordError(true);

            if (error.message.includes('auth/requires-recent-login')) {
                setShowReAuthModal(true);
                posthog.capture('Reauth Required For PW Change', { user: user.email });
            }
            setTimeout(() => {
                setChangePasswordError(false);
            }, 2000);
        });
    };

    return (
        <div>
            <Layout>
                <Modal centered title="Account Delete Confirmation" open={accountDeleteModal} onOk={handleDelete} onCancel={() => setAccountDeleteModal(false)}>
                    <p style={{ fontSize: '1.1rem', margin: '0' }}>Are You Sure You Want To Delete Your Account?</p> <p>This Will Also Cancel Any Active Subscriptions.</p>
                </Modal>
                <Modal centered title="Reauthentication Required" open={showReAuthModal} onOk={() => signOut(firebaseAuth)} okText="Sign Out" onCancel={() => setShowReAuthModal(false)}>
                    <p style={{ fontSize: '1.1rem', margin: '0' }}>Please Sign Back In To Make Account Changes</p>
                </Modal>
                <Button
                    onClick={() => setShowTutorial(true)}
                    className={styles.tutorialButton}
                >
                    View Tutorials
                </Button>
                <Space className={styles.settingsContainer}>
                    <Space className={styles.repListContainer}>
                        {contactAdded ? <Alert message="Contact Added" type="success" /> : ''}

                        <Card title="Add New Contact">
                            <div style={{ display: 'flex', flexFlow: 'column' }}>
                                <p className={styles.newUserLabels} style={{ marginBottom: '2rem', fontStyle: 'italic' }}>This contact can be linked to future QR Codes to receive restock notifications.</p>
                                <div className={styles.repInputBox}>
                                    <div>
                                        <p>Name</p>
                                        <Input maxLength={40} value={newRep.name} name="name" onChange={handleRepChange} />
                                    </div>
                                    <div>
                                        <p>Phone Number For Notifications</p>
                                        <Input placeholder="(xxx)-xxx-xxxx" maxLength={18} value={newRep.number} name="number" onChange={handleRepChange} />
                                    </div>
                                    <Button className={styles.addButton} type="primary" disabled={disableAddRep} onClick={() => saveContact(newRep)}>Add</Button>
                                    <Space>
                                        {dupeNum ? <Alert message="Number Already Exists" type="error" /> : ''}
                                    </Space>
                                </div>
                            </div>
                        </Card>
                        {/* input to add additional reps to contact list
                        iterate and show all added reps + numbers */}
                        <div>
                            <Collapse>
                                <Panel header="Contact List">
                                    <div className={styles.repScroll}>
                                        <Input placeholder="Search Contacts..." value={searchRep} name="repSearch" onChange={handleRepSearch} className={styles.searchRepsInput} />
                                        <div
                                            className={styles.repContainerTop}
                                        >
                                            <p>Name</p>
                                            <p>Number</p>
                                            <p>Action</p>
                                        </div>
                                        {contactAlert ? <Alert message="Must Have At Least 1 Contact" type="error" /> : ''}
                                        {filteredSearch && filteredSearch.length > 0
                                            ? filteredSearch.map((num, idx) => (
                                                <div
                                                    className={styles.repContainer}
                                                    key={idx}
                                                >
                                                    <div className={styles.repInfo}>
                                                        <p className={styles.repName}>{num?.name}</p>
                                                    </div>
                                                    <div className={styles.repInfo}>
                                                        <p>{num?.number}</p>
                                                    </div>
                                                    <Button type="primary" danger onClick={() => removeRep(num?.name, num?.number, num?.id)}>Remove</Button>
                                                </div>
                                            )) : <div><p>No Contacts Found. Please Add One.</p></div>}
                                    </div>

                                </Panel>
                            </Collapse>
                        </div>
                        <div>
                            <Collapse>
                                <Panel header="Additional Features">
                                    <div>
                                        {updateSetting ? <Alert message="Saving Settings..." type="warning" style={{ marginBottom: '1rem' }} /> : ''}
                                        {isUserPremium.planName === 'silver' || isUserPremium.planName === 'gold'

                                            ? (
                                                <div style={{ display: 'flex', flexFlow: 'column', gap: '2rem' }}>
                                                    <div>

                                                        <div>
                                                    Allow Customer To Text Contact Directly
                                                        </div>
                                                        <p style={{ fontSize: '.75rem', fontWeight: '300' }}>Msg/data rates apply.</p>
                                                        <div style={{
                                                            display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem',
                                                        }}
                                                        >
                                                            <Button className={premiumContext.directText ? styles.buttonSettingSelected : ''} type={premiumContext.directText ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('directText', 'enable')}>Yes</Button>
                                                            <Button className={!premiumContext.directText ? styles.buttonSettingSelected : ''} type={!premiumContext.directText ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('directText', 'disable')}>No</Button>
                                                        </div>
                                                    </div>
                                                    {isUserPremium.planName === 'gold' ? (
                                                        <>
                                                            <div>

                                                                <div>
                                                            Daily Emails - Pending Restocks
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem',
                                                                }}
                                                                >
                                                                    <Button className={premiumContext.pendingEmails ? styles.buttonSettingSelected : ''} type={premiumContext.pendingEmails ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('pendingEmails', 'enable')}>Yes</Button>
                                                                    <Button className={!premiumContext.pendingEmails ? styles.buttonSettingSelected : ''} type={!premiumContext.pendingEmails ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('pendingEmails', 'disable')}>No</Button>
                                                                </div>
                                                            </div>
                                                            <div>

                                                                <div>
                                                            End of Month Recap Emails
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem',
                                                                }}
                                                                >
                                                                    <Button className={premiumContext.monthlyEmails ? styles.buttonSettingSelected : ''} type={premiumContext.monthlyEmails ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('monthlyEmails', 'enable')}>Yes</Button>
                                                                    <Button className={!premiumContext.monthlyEmails ? styles.buttonSettingSelected : ''} type={!premiumContext.monthlyEmails ? 'primary' : ''} onClick={() => handlePremiumSettingsToggle('monthlyEmails', 'disable')}>No</Button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : ''}
                                                </div>
                                            )
                                            : <div>Features Only Available On The Silver Plan</div>}
                                    </div>

                                </Panel>
                            </Collapse>
                        </div>
                        <Space className={styles.businessInput}>
                            <Collapse>
                                <Panel header="Account Settings">
                                    {displayAlert ? <Alert message="Business name updated" type="success" className={styles.successAlert} /> : ''}

                                    <div className={styles.businessNameContainer}>
                                        <p style={{ marginBottom: '0' }}>Company Name</p>
                                        <Input placeholder="Business Name..." value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                                        <Button type="primary" onClick={() => saveBusinessName(businessName)}>Update</Button>
                                    </div>
                                    {user.providerData[0].providerId.includes('google') ? '' : (
                                        <div className={styles.businessNameContainer}>
                                            <p style={{ marginBottom: '0' }}>Update Password</p>
                                            {passwordMatchInvalid ? <Alert message="Passwords Do Not Match" type="error" className={styles.successAlert} /> : ''}
                                            {invalidLength ? <Alert message="Password Must Be At Least 6 Characters" type="error" className={styles.successAlert} /> : ''}
                                            {passwordChangeSuccess ? <Alert message="Password Successfully Updated" type="success" className={styles.successAlert} /> : ''}
                                            {changePasswordError ? <Alert message="Error Updating Password. Please Try Again." type="error" className={styles.successAlert} /> : ''}
                                            <Form name="ChangePassword" onFinish={submitChangePassword} className={styles.registerForm} layout="vertical">
                                                <Form.Item label="Password" name="password" extra="Password must be at least 6 characters" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow} required={false}>
                                                    <Input.Password name="changePassword" value={credentials.changePassword} onChange={handlePasswordChange} />
                                                </Form.Item>
                                                <Form.Item label="Confirm Password" name="confirmPass" rules={[{ required: true, message: 'Please input password' }]} className={styles.formRow} required={false}>
                                                    <Input.Password name="confirmPassword" value={credentials.confirmPassword} onChange={handlePasswordChange} />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit" className={styles.registerButton} disabled={changePassword.confirmPassword.length < 1 || changePassword.changePassword.length < 1}>
                                                        {changePasswordSubmitting ? 'Updating...' : 'Change'}
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </div>
                                    )}

                                </Panel>
                            </Collapse>
                        </Space>
                    </Space>
                    <Collapse>
                        <Panel header="Manage Plan">
                            <Space className={styles.billingContainer}>

                                <div className={styles.currentPlan}>
                            Current Plan: {isUserPremium.planName || 'No Active Plan'}
                                </div>
                                <Space>
                                    <Button className={styles.viewPlansLink}>
                                        <Link href="/plans">{isUserPremium.planName !== '' ? 'View Plans' : 'Choose A Plan'}</Link>
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
