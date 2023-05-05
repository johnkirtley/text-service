/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-len */
import { useState, useContext, useEffect } from 'react';
import JSZip from 'jszip';
import {
    Layout, Space, Empty, Button, Modal, Spin,
} from 'antd';
// import { saveAs } from 'file-saver';
import axios from 'axios';
import ClientContext from '../../Context/ClientContext';
import ProductContext from '../../Context/ProductContext';
import { useAuth } from '../../Context/AuthContext';

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
                            closable={sending}
                            closeIcon={sending}
                            okText="Email & Download Codes"
                            onCancel={handleCancel}
                            okButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                            cancelButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                        >
                            {sendingComplete ? <p>Sent Successfully</p> : ''}
                            {sending ? <><span className={styles.overlay} /><Space wrap className={styles.spinnerBackground}><Spin tip="Sending..." size="large" className={styles.codesLoading} /></Space> </>

                                : (
                                    <>
                                        <p><span className={styles.highlight}>Client:</span> {clientInfo}</p>
                                        <p><span className={styles.highlight}>Selected Rep:</span> {repName}</p>
                                        <p><span className={styles.highlight}>Total Codes:</span> {qrCodes.length}</p>
                                        <p><span className={styles.highlight}>Selected Products:</span></p>
                                        <div className={qrCodes.length > 10 ? styles.codeConfirmScroll : ''}>
                                            {qrCodes.map((code, idx) => (
                                                <p key={idx}>- {code.name}</p>
                                            ))}
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
