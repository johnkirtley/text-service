/* eslint-disable max-len */
/* eslint-disable no-shadow */
import { useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import {
    RepContext, CustomerContext, ClientContext, BusinessNameContext, ProductContext,
    OwnerIdContext, SelectedContext, PremiumSettingsContext, PendingContext,
} from '../Context/Context';
import { AuthProvider } from '../Context/AuthContext';

// Global Styles
import '../styles/globals.css';
import 'antd/dist/antd.css';

const defaultPremiumSettings = {
    directText: false,
    pendingEmails: false,
    monthlyEmails: false,
};

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        autocapture: false,
        // Enable debug mode in development
        loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug();
        },

    });
}

export default function MyApp({ Component, pageProps }) {
    const [repInfo, setRepInfo] = useState([]);
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientInfo, setClientInfo] = useState('');
    // const [authContext, setAuthContext] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [curProducts, setCurProducts] = useState([]);
    const [ownerId, setOwnerId] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [pendingRestocks, setPendingRestocks] = useState([]);
    const [premiumContext, setPremiumContext] = useState(defaultPremiumSettings);

    return (
        <PostHogProvider client={posthog}>
            <SelectedContext.Provider value={{ selectedProducts, setSelectedProducts }}>
                <ProductContext.Provider value={{ curProducts, setCurProducts }}>
                    <CustomerContext.Provider value={{ customerInfo, setCustomerInfo }}>
                        <BusinessNameContext.Provider value={{ businessName, setBusinessName }}>
                            <OwnerIdContext.Provider value={{ ownerId, setOwnerId }}>
                                <RepContext.Provider value={{ repInfo, setRepInfo }}>
                                    <PendingContext.Provider value={{ pendingRestocks, setPendingRestocks }}>
                                        <ClientContext.Provider value={{ clientInfo, setClientInfo }}>
                                            <PremiumSettingsContext.Provider
                                                value={{ premiumContext, setPremiumContext }}
                                            >
                                                <AuthProvider>
                                                    <Component {...pageProps} />
                                                </AuthProvider>
                                            </PremiumSettingsContext.Provider>
                                        </ClientContext.Provider>
                                    </PendingContext.Provider>
                                </RepContext.Provider>
                            </OwnerIdContext.Provider>
                        </BusinessNameContext.Provider>
                    </CustomerContext.Provider>
                </ProductContext.Provider>
            </SelectedContext.Provider>
        </PostHogProvider>

    );
}
