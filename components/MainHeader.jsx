import { useContext } from 'react';
import { signOut } from 'firebase/auth';
import { Layout } from 'antd';
import { firebaseAuth } from '../firebase/clientApp';
import { AuthContext } from '../Context/Context';

// Styles
import styles from '../styles/Home.module.css';

const { Header } = Layout;

// eslint-disable-next-line no-unused-vars
export default function MainHeader({ companyName }) {
    const { authContext } = useContext(AuthContext);
    const signOutButton = async () => signOut(firebaseAuth)
        .then(() => console.log('signed out'))
        .catch((error) => console.log(error));
    return (
        <Header className={`${styles.title} ${styles.header}`}>
            Welcome {authContext?.displayName}
            <button type="button" className="signOut-button" onClick={signOutButton}>
                Sign Out
            </button>
        </Header>
    );
}
