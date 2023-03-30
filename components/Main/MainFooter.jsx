import { Layout } from 'antd';
import Link from 'next/link';

import styles from '../../styles/Home.module.css';

const { Footer } = Layout;

function MainFooter() {
    return (
        <Footer className={styles.footer}>
            <div>
                Logo
            </div>
            <div className={styles.footerLinks}>
                <Link href="/">Home</Link>
                <Link href="/plans">Pricing</Link>
                <Link href="/">About</Link>
                <Link href="/">Contact</Link>
                <Link href="/">Terms & Privacy</Link>
            </div>
        </Footer>
    );
}

export default MainFooter;
