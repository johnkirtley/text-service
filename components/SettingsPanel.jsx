import {
    Layout, Input, Button, Space,
} from 'antd';

export default function SettingsPanel({
    setRepContact, setCompanyName, repContact, companyName,
}) {
    const handleNumberChange = (e) => {
        setRepContact(e.target.value);
    };

    const handleNameChange = (e) => {
        setCompanyName(e.target.value);
    };

    const saveContact = (num) => {
        // backend api call to store phone number in DB
        const sanitizedNum = num.replace(/^(\+)|\D/g, '$1');

        setRepContact(sanitizedNum);

        console.log(repContact);
    };

    const saveName = (name) => {
        setCompanyName(name);
    };

    return (
        <div>
            <Layout>
                <Space style={{ display: 'flex', flexFlow: 'column' }}>
                    <Space>
                        <Input placeholder="Company Name" value={companyName} name="companyname" onChange={handleNameChange} />
                        <Button onClick={() => saveName(companyName)}>Update</Button>
                    </Space>
                    <Space>
                        <Input placeholder="Enter Rep Number" value={repContact} name="repContact" onChange={handleNumberChange} />
                        <Button onClick={() => saveContact(repContact)}>Save</Button>
                    </Space>
                </Space>
            </Layout>
        </div>
    );
}
