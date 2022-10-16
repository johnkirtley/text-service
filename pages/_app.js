import { useState } from 'react';
import { RepContext, CustomerContext, ClientContext } from '../Context/Context';

// Global Styles
import '../styles/globals.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState('');
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientInfo, setClientInfo] = useState('');

    return (
        <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
            <RepContext.Provider value={{ repInfo, setRepInfo }}>
                <ClientContext.Provider value={{ clientInfo, setClientInfo }}>
                    <Component {...pageProps} />
                </ClientContext.Provider>
            </RepContext.Provider>
        </CustomerContext.Provider>
    );
}
