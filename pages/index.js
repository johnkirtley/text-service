import { useState, useContext } from 'react';
import { Layout, Menu } from 'antd';
import { CustomerContext } from '../Context/Context';
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
