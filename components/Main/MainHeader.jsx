/* eslint-disable react/destructuring-assignment */
import { useContext } from 'react';
import Image from 'next/image';
import { signOut } from 'firebase/auth';
import { Layout } from 'antd';
import { firebaseAuth } from '../../firebase/clientApp';
import { CustomerContext, BusinessNameContext } from '../../Context/Context';

// Styles
import styles from '../../styles/Home.module.css';

const { Header } = Layout;

// eslint-disable-next-line no-unused-vars
export default function MainHeader({ companyName }) {
    const { setCustomerInfo } = useContext(CustomerContext);
    const { setBusinessName } = useContext(BusinessNameContext);

    const signOutButton = async () => signOut(firebaseAuth)
        .then(() => {
            setCustomerInfo('');
            setBusinessName('');
        })
        .catch((error) => console.log(error));
    return (
        <Header className={`${styles.title} ${styles.header}`}>
            <div className={styles.logoContainer}>
                <Image src="/supplymate-logo-nobg.png" alt="supply mate logo" width={30} height={30} />
                <p className={styles.logoText}>SUPPLY MATE</p>
            </div>
            <button type="button" className="signOut-button" onClick={signOutButton}>
                Sign Out
            </button>
        </Header>
    );
}
