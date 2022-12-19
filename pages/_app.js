import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { RepContext, CustomerContext, ClientContext, AuthContext } from '../Context/Context';
import { firebaseAuth } from '../firebase/clientApp';

// Global Styles
import '../styles/globals.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState('');
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientInfo, setClientInfo] = useState('');
    const [authContext, setAuthContext] = useState(null);

    const auth = firebaseAuth;

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setAuthContext(user);
            // console.log('app.js', user);
        });
    }, [auth]);

    return (
        <AuthContext.Provider value={{ authContext }}>
            <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
                <RepContext.Provider value={{ repInfo, setRepInfo }}>
                    <ClientContext.Provider value={{ clientInfo, setClientInfo }}>
                        <Component {...pageProps} />
                    </ClientContext.Provider>
                </RepContext.Provider>
            </CustomerContext.Provider>
        </AuthContext.Provider>
    );
}
