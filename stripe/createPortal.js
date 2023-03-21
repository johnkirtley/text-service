import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '../firebase/clientApp';

const generatePortal = () => {
    const createPortalLink = httpsCallable(
        firebaseFunctions,
        'ext-firestore-stripe-payments-createPortalLink',
    );

    if (typeof window !== 'undefined') {
        createPortalLink({ returnUrl: window.location.origin })
            .then((result) => {
                const { url } = result.data;
                window.location.assign(url);
            })
            .catch((error) => {
                console.error(error);
            });
    }
};

export default generatePortal;
