import { Layout } from 'antd';
import { Home, Products, PendingRestocks, SettingsPanel } from '..';

// Styles
import styles from '../../styles/Home.module.css';

const { Content } = Layout;

function MainView({ view, setShowTutorial }) {
    return (
        <Layout className={styles.container}>

            <Content className={styles.main}>

                {view === '3' ? <Home /> : ''}
                {view === '1' ? <Products /> : ''}
                {view === '2' ? <PendingRestocks /> : ''}
                {view === '4' ? <SettingsPanel setShowTutorial={setShowTutorial} /> : ''}

            </Content>

        </Layout>
    );
}

export default MainView;
