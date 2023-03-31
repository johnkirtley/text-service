// import { firebaseAuth } from '../firebase/clientApp';

async function getSubscriber(email) {
    const response = await fetch('/api/get-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('Success:', data);
    return data;
}

async function isUserPremium(email) {
    console.log('email', email);
    const subscriber = await getSubscriber(email);
    console.log('subscriber', subscriber);

    let role;
    let planStatus;
    if (subscriber.sub.data.length > 0) {
        role = subscriber.sub.data[0].plan.nickname;
        planStatus = subscriber.sub.data[0].status;
    } else {
        role = '';
        planStatus = '';
    }

    return { planName: role, status: planStatus };
}

export default isUserPremium;
