import { useState } from 'react';
import {
    RepContext, CustomerContext, ClientContext, BusinessNameContext, ProductContext,
    OwnerIdContext,
} from '../Context/Context';
import { AuthProvider } from '../Context/AuthContext';

// Global Styles
import '../styles/globals.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState([]);
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientInfo, setClientInfo] = useState('');
    // const [authContext, setAuthContext] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [curProducts, setCurProducts] = useState([]);
    const [ownerId, setOwnerId] = useState(null);

    return (
        <ProductContext.Provider value={{ curProducts, setCurProducts }}>
            <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
                <BusinessNameContext.Provider value={{ businessName, setBusinessName }}>
                    <OwnerIdContext.Provider value={{ ownerId, setOwnerId }}>
                        <RepContext.Provider value={{ repInfo, setRepInfo }}>
                            <ClientContext.Provider value={{ clientInfo, setClientInfo }}>
                                <AuthProvider>
                                    <Component {...pageProps} />
                                </AuthProvider>
                            </ClientContext.Provider>
                        </RepContext.Provider>
                    </OwnerIdContext.Provider>
                </BusinessNameContext.Provider>
            </CustomerContext.Provider>
        </ProductContext.Provider>
    );
}
