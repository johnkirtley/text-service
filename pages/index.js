import { useState } from 'react';
import Head from 'next/head';
// import Image from 'next/image';
import { Layout, Menu } from 'antd';
import styles from '../styles/Home.module.css';
import {
    Home, MainHeader, Products, Settings,
} from '../components';

const {
    Content, Footer, Sider,
} = Layout;

export default function MainComponent() {
    const [collapsed, setCollapsed] = useState(false);
    const [view, setView] = useState('1');

    function getItem(label, key, icon, children) {
        return {
            key,
            icon,
            children,
            label,
        };
    }

    const items = [
        getItem('Home', '1'),
        getItem('Products and QR Codes', '2'),
        getItem('Settings', '3'),
    ];

    return (
        <>
            <MainHeader />
            <Layout>
                <Head>
                    <title>Text Service | Automate Distributor Contact</title>
                    <meta
                        name="description"
                        content="Text Service | Automate Distributor Contact"
                    />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

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
                <Layout className={styles.container}>

                    <Content className={styles.main}>

                        {view === '1' ? <Home /> : ''}
                        {view === '2' ? <Products /> : ''}
                        {view === '3' ? <Settings /> : ''}

                    </Content>

                    <Footer className={styles.footer}>
                        <p>Footer Component</p>
                    </Footer>
                </Layout>
            </Layout>
        </>
    );
}
