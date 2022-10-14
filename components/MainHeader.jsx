import { useState } from 'react';
import { Layout } from 'antd';

import styles from '../styles/Home.module.css';

const { Header } = Layout;

export default function MainHeader() {
    const [companyName, setCompanyName] = useState('');

    if (!companyName) {
        setCompanyName('Jack');
    }

    return (
        <Header className={styles.title}>
            Welcome {companyName}
        </Header>
    );
}
