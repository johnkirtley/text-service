import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import { AuthContext, CustomerContext } from '../Context/Context';
import { MetaHead, MainHeader, MainFooter } from '../components';
import MainView from '../components/MainView';

// Helper Functions
import { items } from '../utils/helpers';

// Styles

const { Sider } = Layout;

export default function MainComponent() {
    const [collapsed, setCollapsed] = useState(false);
    const [view, setView] = useState('1');
    const { customerInfo } = useContext(CustomerContext);
    const { authContext } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        authContext !== null ? router.push('/') : router.push('/login');
    }, [authContext]);

    return (
        <>
            <MainHeader companyName={customerInfo} />
            <Layout>
                <MetaHead />
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <div className="logo" />

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
        </>
    );
}
