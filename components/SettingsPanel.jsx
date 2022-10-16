import { useContext } from 'react';
import { Layout, Input, Button, Space } from 'antd';
import { RepContext, CustomerContext } from '../Context/Context';

export default function SettingsPanel() {
    const { repInfo, setRepInfo } = useContext(RepContext);
    const { customerInfo, setCustomerInfo } = useContext(CustomerContext);

    const handleNumberChange = (e) => {
        setRepInfo(e.target.value);
    };

    const handleNameChange = (e) => {
        setCustomerInfo(e.target.value);
    };

    const saveContact = (num) => {
        // backend api call to store phone number in DB
        const sanitizedNum = num.replace(/^(\+)|\D/g, '$1');

        setRepInfo(sanitizedNum);
    };

    const saveName = (name) => {
        setCustomerInfo(name);
    };

    return (
        <div>
            <Layout>
                <Space style={{ display: 'flex', flexFlow: 'column' }}>
                    <Space>
                        <Input placeholder="Company Name" value={customerInfo} name="companyname" onChange={handleNameChange} />
                        <Button onClick={() => saveName(customerInfo)}>Update</Button>
                    </Space>
                    <Space>
                        <Input placeholder="Enter Rep Number" value={repInfo} name="repContact" onChange={handleNumberChange} />
                        <Button onClick={() => saveContact(repInfo)}>Save</Button>
                    </Space>
                </Space>
            </Layout>
        </div>
    );
}
