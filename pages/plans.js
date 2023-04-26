import { Layout } from 'antd';
import Image from 'next/image';
import { MainFooter, PlansPage } from '../components';

import styles from '../styles/Home.module.css';

const { Header } = Layout;

export default function Plans() {
    return (
        <div>
            <Header className={`${styles.title} ${styles.header}`}>
                <div className={styles.logoContainer}>
                    <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                    <p className={styles.logoText}>SUPPLY MATE</p>
                </div>
            </Header>
            <Layout style={{ minHeight: '100vh' }}>
                <PlansPage />
            </Layout>
            <MainFooter />
        </div>
    );
}
