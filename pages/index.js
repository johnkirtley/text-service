/* eslint-disable import/no-extraneous-dependencies */
import { useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import { HomeOutlined, BarcodeOutlined, PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { getDocs, collection, query, where } from 'firebase/firestore';
import {
    AuthContext, BusinessNameContext, CustomerContext, RepContext, ProductContext, OwnerIdContext,
} from '../Context/Context';
import { MetaHead, MainHeader, MainFooter } from '../components';
import MainView from '../components/Main/MainView';
import { firestore } from '../firebase/clientApp';

// Styles
import styles from '../styles/Home.module.css';

export default function MainComponent() {
    const [view, setView] = useState('1');
    const { setCustomerInfo } = useContext(CustomerContext);
    const { businessName, setBusinessName } = useContext(BusinessNameContext);
    const { authContext } = useContext(AuthContext);
    const { setRepInfo } = useContext(RepContext);
    const { setCurProducts } = useContext(ProductContext);
    const { setOwnerId } = useContext(OwnerIdContext);
    const router = useRouter();

    function getItem(label, key, icon, children) {
        return { key, icon, children, label };
    }

    const items = [
        getItem('Home', '1', <HomeOutlined />),
        getItem('Products and QR Codes', '2', <BarcodeOutlined />),
        getItem('Pending Restocks', '3', <PlusCircleOutlined />),
        getItem('Settings', '4', <SettingOutlined />),
    ];

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('email', '==', authContext.email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        // add product context, set info here like rep info
        // this could eliminate re render on product
        querySnapshot.forEach((document) => {
            if (document.data().email === authContext.email) {
                console.log('firebase query', document.data());
                setCustomerInfo(document.data());
                setBusinessName(document.data().businessName);
                setRepInfo(document.data().repNumbers);
                setCurProducts(document.data().products);
                setOwnerId(document.data().uid);
            }
        });
    }, [authContext, setCustomerInfo, setBusinessName, setRepInfo, setCurProducts, setOwnerId]);

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        authContext !== null ? router.push('/') : router.push('/login');
    }, [authContext]);

    useEffect(() => {
        if (authContext) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [authContext, getQuery]);

    return (
        <div>
            {authContext === null ? '' : (
                <div>
                    <MainHeader companyName={businessName} />
                    <Layout style={{ minHeight: '100vh' }}>
                        <MetaHead />

                        <Menu
                            theme="light"
                            defaultSelectedKeys={['1']}
                            mode="horizontal"
                            items={items}
                            onSelect={(key) => setView(key.key)}
                            className={styles.navMenu}
                        />

                        <MainView view={view} />
                    </Layout>
                    <MainFooter />
                </div>
            )}
        </div>

    );
}
