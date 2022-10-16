import { useState } from 'react';
import { RepContext, CustomerContext } from '../Context/Context';
import '../styles/globals.css';
import 'antd/dist/antd.css';

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState('');
    const [customerInfo, setCustomerInfo] = useState('');

    return (
        <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
            <RepContext.Provider value={{ repInfo, setRepInfo }}>
                <Component {...pageProps} />
            </RepContext.Provider>
        </CustomerContext.Provider>
    );
}
