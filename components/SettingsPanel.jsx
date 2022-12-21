import { useContext, useState } from 'react';
import { Layout, Input, Button, Space } from 'antd';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { RepContext, BusinessNameContext, AuthContext } from '../Context/Context';
import { firestore } from '../firebase/clientApp';

// Helper Functions
import { handleTextChange } from '../utils/helpers';

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

    const saveBusinessName = async (val) => {
        const nameUpdateRef = doc(firestore, 'users', authContext.email);

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

        setNewRep(defaultRep);

        const filtered = repInfo.filter((rep) => rep.number !== num);

        setRepInfo(filtered);
    };

    return (
        <div>
            <Layout>
                <Space style={{ display: 'flex', flexFlow: 'column' }}>
                    <Space>
                        <Input placeholder="Company Name" value={businessName} name="companyname" onChange={(e) => handleTextChange(e, setBusinessName)} />
                        <Button onClick={() => saveBusinessName(businessName)}>Save</Button>
                    </Space>
                    <Space style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'column', textAlign: 'center',
                    }}
                    >
                        <Input placeholder="Enter Rep Name" value={newRep.name} name="name" onChange={handleRepChange} />
                        <Input placeholder="Enter Rep Number" value={newRep.number} name="number" onChange={handleRepChange} />
                        <Button onClick={() => saveContact(newRep)}>Add</Button>
                        {/* input to add additional reps to contact list
                        iterate and show all added reps + numbers */}
                        {repInfo && repInfo.length > 0
                            ? repInfo.map((num, idx) => (
                                <div key={idx}>
                                    <p>{num?.name}</p>
                                    <p>{num?.number}</p>
                                    <Button type="primary" danger onClick={() => removeRep(num?.name, num?.number)}>Remove</Button>
                                </div>
                            )) : <div><p>No Reps Found. Please Add One.</p></div>}
                    </Space>
                </Space>
            </Layout>
        </div>
    );
}
