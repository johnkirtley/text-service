/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-len */
import { useState, useContext, useEffect } from 'react';
import JSZip from 'jszip';
import Link from 'next/link';
import {
    Layout, Space, Empty, Button, Modal, Spin,
} from 'antd';
// import { saveAs } from 'file-saver';
import axios from 'axios';
import logger from '../../utils/logger';
import ClientContext from '../../Context/ClientContext';
import ProductContext from '../../Context/ProductContext';
import { useAuth } from '../../Context/AuthContext';
import usePremiumStatus from '../../stripe/usePremiumStatus';

// styles
import styles from './QrCode.module.css';

const { Content } = Layout;

export default function QRCode({
    qrCodes, loading, selectedRep, repOptions, checkActive, setCurrent, setSelectedRep, setClientInfo, setSelectedProducts, setQRCodes,
}) {
    const { clientInfo } = useContext(ClientContext);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendingComplete, setSendingComplete] = useState(false);
    const [repName, setRepName] = useState('');
    const { curProducts, setCurProducts } = useContext(ProductContext);
    const { user } = useAuth();

    const { planName } = usePremiumStatus(user?.email);

    const makeInactive = () => {
        const newArr = [...curProducts];
        const unchecked = newArr.map((obj) => ({
            product: obj.product,
            isChecked: false,
        }));
        setCurProducts(unchecked);
    };

    useEffect(() => {
        const selectedName = repOptions.filter((rep) => rep.value === selectedRep);

        if (selectedName.length > 0) {
            const sanitizedName = selectedName[0]?.label.split('-');
            setRepName(sanitizedName[0]);
        }
    }, [selectedRep]);

    const sanitizedFileName = clientInfo.replace(/ /g, '-');
    const zipImages = () => {
        setSending(true);
        const zip = new JSZip();
        const codeFolder = zip.folder('QR-Codes');
        const canvas = Array.from(document.querySelector('#qr-code-container').children);

        const fileGeneration = () => new Promise((resolve) => {
            qrCodes.forEach((code, idx) => {
                canvas[idx].toBlob((data) => {
                    const formattedName = code.name.replace(/ /g, '-');
                    codeFolder.file(`${formattedName}.png`, data);
                });
            });
            resolve();
        });

        fileGeneration().then(() => {
            setTimeout(() => {
                codeFolder.generateAsync({ type: 'base64' }).then((content) => {
                    const data = {
                        base64Codes: content,
                        clientName: `${sanitizedFileName}`,
                        email: user.email,
                    };

                    axios.post('https://text-service-mailer.herokuapp.com/api/code_submission/send', data)
                        .then(() => {
                            const dataUrl = `data:application/zip;base64,${content}`;
                            const link = document.createElement('a');
                            link.href = dataUrl;
                            link.download = `${sanitizedFileName}`;

                            // Append the link to the document body
                            document.body.appendChild(link);

                            // Simulate a click on the link
                            link.click();

                            // Remove the link from the document body
                            document.body.removeChild(link);

                            logger('action', 'Codes Downloaded', { userId: user.uid, client: clientInfo, codeCount: qrCodes.length });
                            setSending(false);
                            setSendingComplete(true);
                            // reset all qr code state after codes sent
                            setTimeout(() => {
                                makeInactive();
                                setCurrent(0);
                                setClientInfo('');
                                setSelectedProducts([]);
                                setSelectedRep('');
                                setQRCodes([]);
                                setShowModal(false);
                                setSendingComplete(false);
                            }, 1000);
                        })
                        .catch((err) => {
                            logger('error', 'Error Downloading Codes', { userId: user.uid, client: clientInfo, codeCount: qrCodes.length, error: err });
                            console.log(err);
                        });
                });
            }, 2000);
        });
    };

    const handleOk = () => {
        zipImages();
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    const sendEmail = () => {
        setShowModal(true);
    };

    return (
        <div className={loading ? styles.hideContainer : styles.showContainer}>
            {qrCodes.length > 0
                ? (
                    <div className={styles.codeContainer}>
                        <Modal
                            className={styles.modal}
                            title="QR Code Confirmation"
                            open={showModal}
                            onOk={handleOk}
                            closable={!sending}
                            closeIcon={!sending}
                            okText="Email & Download Codes"
                            onCancel={handleCancel}
                            okButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                            cancelButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                        >
                            {sendingComplete ? <p>Sent Successfully</p> : ''}
                            {sending ? <><span className={styles.overlay} /><Space wrap className={styles.spinnerBackground}><Spin tip="Sending..." size="large" className={styles.codesLoading} /></Space> </>

                                : (
                                    <>
                                        {planName === '' ? (
                                            <div className={styles.signUpAlert} style={{ marginBottom: '2rem' }}>
                                                <div
                                                    className="ant-alert ant-alert-warning"
                                                    style={{
                                                        display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'column', textAlign: 'center',
                                                    }}
                                                >
                                                    <span role="img" aria-label="info-circle" className="anticon anticon-info-circle ant-alert-icon"><svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" /></svg></span>
                                                    <p style={{ margin: '0' }}>Looks Like You Don&apos;t Have An Active Plan. <br />You Can Still Download Your Codes, But Restock Features Will Not Be Available.</p>
                                                </div>
                                            </div>
                                        ) : ''}
                                        <div style={{ textAlign: 'center' }}>
                                            <p><span className={styles.highlight}>Client:</span> {clientInfo}</p>
                                            <p><span className={styles.highlight}>Selected Rep:</span> {repName}</p>
                                            <p><span className={styles.highlight}>Total Codes:</span> {qrCodes.length}</p>
                                            <p><span className={styles.highlight}>Selected Products:</span></p>
                                            <div className={qrCodes.length > 10 ? styles.codeConfirmScroll : ''}>
                                                {qrCodes.map((code, idx) => (
                                                    <p key={idx}>- {code.name}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                        </Modal>

                        <Content className={styles.codesGenerated}>
                            <Space className={styles.codeSpacer} size="large">
                                {/* <p className={styles.generatedCodes}>
                            Preview Panel
                                </p> */}
                                <div
                                    id="qr-code-container"
                                    className={styles.qrContainer}
                                />
                            </Space>

                            <Button onClick={sendEmail} type="primary" className={styles.sendForPrintingButton}>
                            Confirm
                            </Button>
                        </Content>
                    </div>
                ) : ''}
            {!checkActive() ? <Empty description="Please Select Products." /> : ''}
        </div>
    );
}
