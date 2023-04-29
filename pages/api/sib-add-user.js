const SibApiV3Sdk = require('sib-api-v3-sdk');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { newUserEmail } = req.body;

        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];

        apiKey.apiKey = process.env.SIB_API_KEY;

        const apiInstance = new SibApiV3Sdk.ContactsApi();

        const createContact = new SibApiV3Sdk.CreateContact();

        createContact.email = newUserEmail;
        createContact.listIds = [8];

        apiInstance.createContact(createContact).then((data) => {
            res.status(200).json({ 'User Added To SIB': data });
        }).catch((err) => {
            res.status(500).json({ message: err });
        });
    } else {
        res.status(500).json({ message: 'method not allowed' });
    }
}
