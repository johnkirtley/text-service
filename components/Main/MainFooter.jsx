import { Layout } from 'antd';

import styles from '../../styles/Home.module.css';

const { Footer } = Layout;

function MainFooter() {
    return (
        <Footer className={styles.footer}>
            <p>Footer Component</p>
        </Footer>
    );
}

export default MainFooter;
