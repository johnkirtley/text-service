import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../firebase/clientApp';
import {
    RepContext, CustomerContext, ClientContext, AuthContext, BusinessNameContext, ProductContext,
    OwnerIdContext,
} from '../Context/Context';
import usePremiumStatus from '../stripe/usePremiumStatus';

// Global Styles
import '../styles/globals.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState([]);
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientInfo, setClientInfo] = useState('');
    const [authContext, setAuthContext] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [curProducts, setCurProducts] = useState([]);
    const [ownerId, setOwnerId] = useState(null);

    const isUserPremium = usePremiumStatus(authContext);

    console.log('planStatus', isUserPremium);

    const auth = firebaseAuth;

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setAuthContext(user);
        });
    }, [auth]);

    return (
        <AuthContext.Provider value={{ authContext }}>
            <ProductContext.Provider value={{ curProducts, setCurProducts }}>
                <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
                    <BusinessNameContext.Provider value={{ businessName, setBusinessName }}>
                        <OwnerIdContext.Provider value={{ ownerId, setOwnerId }}>
                            <RepContext.Provider value={{ repInfo, setRepInfo }}>
                                <ClientContext.Provider value={{ clientInfo, setClientInfo }}>
                                    <Component {...pageProps} />
                                </ClientContext.Provider>
                            </RepContext.Provider>
                        </OwnerIdContext.Provider>
                    </BusinessNameContext.Provider>
                </CustomerContext.Provider>
            </ProductContext.Provider>
        </AuthContext.Provider>
    );
}
