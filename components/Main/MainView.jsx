import { Layout } from 'antd';
import { Home, Products, PendingRestocks, SettingsPanel } from '..';

// Styles
import styles from '../../styles/Home.module.css';

const { Content } = Layout;

function MainView({ view }) {
    return (
        <Layout className={styles.container}>

            <Content className={styles.main}>

                {view === '1' ? <Home /> : ''}
                {view === '2' ? <Products /> : ''}
                {view === '3' ? <PendingRestocks /> : ''}
                {view === '4' ? <SettingsPanel /> : ''}

            </Content>

        </Layout>
    );
}

export default MainView;
