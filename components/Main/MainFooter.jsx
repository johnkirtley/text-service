import { Layout } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

import styles from '../../styles/Home.module.css';

const { Footer } = Layout;

function MainFooter() {
    return (
        <Footer className={styles.footer}>
            <div>
                <div className={styles.logoContainer}>
                    <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                    <p className={styles.logoText}>SUPPLY MATE</p>
                </div>
            </div>
            <div className={styles.footerLinks}>
                <Link href="/">Home</Link>
                <a target="_blank" href="https://supplymate.io/faq" rel="noreferrer">FAQ</a>
                <Link href="/plans">Pricing</Link>
                <Link href="mailto:operations@supplymate.io">Contact Us</Link>
                <Link href="https://supplymate.io/termsofservice" target="_blank" rel="noreferrer">Terms of Service</Link>
                <Link href="https://supplymate.io/privacypolicy" target="_blank" rel="noreferrer">Privacy Policy</Link>
            </div>
        </Footer>
    );
}

export default MainFooter;
