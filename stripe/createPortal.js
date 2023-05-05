// import { httpsCallable } from 'firebase/functions';
// import { firebaseFunctions } from '../firebase/clientApp';

async function createPortalSession(email) {
    let data;
    if (typeof window !== 'undefined') {
        const response = await fetch('/api/create-portal-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, returnUrl: window.location.origin }),
        });

        data = await response.json();
        console.log('Success:', data.message);
    }

    return data;
}

const generatePortal = (email) => {
    if (typeof window !== 'undefined') {
        createPortalSession(email).then((res) => {
            const { url } = res;
            window.location.assign(url);
        }).catch((err) => console.log(err));
    }
};

export default generatePortal;
