import { useContext, useState } from 'react';
import {
    Layout, Input, Button, Space, Alert,
} from 'antd';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { RepContext, BusinessNameContext, AuthContext } from '../../Context/Context';
import { firestore } from '../../firebase/clientApp';

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

    return (
        <div>
            {displayAlert ? <Alert message="Business name updated" type="success" className={styles.successAlert} /> : ''}

            <Layout>
                <Space className={styles.settingsContainer}>
                    <Space className={styles.businessInput}>
                        <p className={styles.businessLabel}>Business Name</p>
                        <Input placeholder="Company Name" value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                        <Button type="primary" onClick={() => saveBusinessName(businessName)}>Save</Button>
                    </Space>
                    <Space className={styles.repListContainer}>
                        <div className={styles.repInputBox}>
                            <p className={styles.addRepLabel}>Add A New Rep</p>
                            <p>Rep Name</p>
                            <Input placeholder="Enter Rep Name" value={newRep.name} name="name" onChange={handleRepChange} />
                            <p>Rep Number</p>
                            <Input placeholder="Enter Rep Number" value={newRep.number} name="number" onChange={handleRepChange} />
                            <Button onClick={() => saveContact(newRep)}>Add</Button>
                        </div>
                        {/* input to add additional reps to contact list
                        iterate and show all added reps + numbers */}
                        <div>
                            <p className={styles.businessLabel}>List of Current Reps</p>
                            {repInfo && repInfo.length > 0
                                ? repInfo.map((num, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.repContainer}
                                    >
                                        <p className={styles.repInfo}>
                                            <span className={styles.repBold}>Name:</span>
                                            {num?.name}
                                        </p>
                                        <p className={styles.repInfo}>
                                            <span className={styles.repBold}>Phone:</span>
                                            {num?.number}
                                        </p>
                                        <Button type="primary" danger onClick={() => removeRep(num?.name, num?.number)}>Remove</Button>
                                    </div>
                                )) : <div><p>No Reps Found. Please Add One.</p></div>}
                        </div>
                    </Space>
                </Space>
            </Layout>
        </div>
    );
}
