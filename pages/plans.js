import { Layout } from 'antd';
import { MainFooter, PlansPage } from '../components';

import styles from '../styles/Home.module.css';

const { Header } = Layout;

export default function Plans() {
    return (
        <div>
            <Header className={`${styles.title} ${styles.header}`}>
            LOGO HERE
            </Header>
            <Layout style={{ minHeight: '100vh' }}>
                <PlansPage />
            </Layout>
            <MainFooter />
        </div>
    );
}
