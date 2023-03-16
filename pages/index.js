import { useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import { getDocs, collection, query, where } from 'firebase/firestore';
import {
    AuthContext, BusinessNameContext, CustomerContext, RepContext, ProductContext, OwnerIdContext,
} from '../Context/Context';
import { MetaHead, MainHeader, MainFooter } from '../components';
import MainView from '../components/Main/MainView';
import { firestore } from '../firebase/clientApp';

// Helper Functions
import { items } from '../utils/helpers';

// Styles

const { Sider } = Layout;

export default function MainComponent() {
    const [collapsed, setCollapsed] = useState(false);
    const [view, setView] = useState('1');
    const { setCustomerInfo } = useContext(CustomerContext);
    const { businessName, setBusinessName } = useContext(BusinessNameContext);
    const { authContext } = useContext(AuthContext);
    const { setRepInfo } = useContext(RepContext);
    const { setCurProducts } = useContext(ProductContext);
    const { setOwnerId } = useContext(OwnerIdContext);
    const router = useRouter();

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
                    <Layout>
                        <MetaHead />
                        <Sider
                            collapsible
                            collapsed={collapsed}
                            onCollapse={(value) => setCollapsed(value)}
                        >
                            <Menu
                                theme="dark"
                                defaultSelectedKeys={['1']}
                                mode="inline"
                                items={items}
                                onSelect={(key) => setView(key.key)}
                            />
                        </Sider>
                        <MainView view={view} />
                    </Layout>
                    <MainFooter />
                </div>
            )}
        </div>

    );
}
