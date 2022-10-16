import { Layout } from 'antd';

// Styles
import styles from '../styles/Home.module.css';

const { Header } = Layout;

export default function MainHeader({ companyName }) {
    return (
        <Header className={`${styles.title} ${styles.header}`}>
            Welcome {companyName}
        </Header>
    );
}
