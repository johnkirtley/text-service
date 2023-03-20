/* eslint-disable max-len */
import { useState, useContext, useEffect } from 'react';
import JSZip from 'jszip';
import {
    Layout, Space, Empty, Button, Modal,
} from 'antd';
// import { saveAs } from 'file-saver';
import axios from 'axios';
import ClientContext from '../../Context/ClientContext';

// styles
import styles from './QrCode.module.css';

const { Content } = Layout;

export default function QRCode({ qrCodes, loading, selectedRep, repOptions }) {
    const { clientInfo } = useContext(ClientContext);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendingComplete, setSendingComplete] = useState(false);
    const [repName, setRepName] = useState('');

    useEffect(() => {
        const selectedName = repOptions.filter((rep) => rep.value === selectedRep);

        if (selectedName.length > 0) {
            const sanitizedName = selectedName[0]?.label.split('-');
            setRepName(sanitizedName[0]);
        }
    }, [selectedRep]);

    const sanitizedFileName = clientInfo.replace(' ', '-');
    const zipImages = () => {
        setSending(true);
        const zip = new JSZip();
        const codeFolder = zip.folder('QR-Codes');
        const canvas = Array.from(document.querySelector('#qr-code-container').children);

        const fileGeneration = () => new Promise((resolve) => {
            qrCodes.forEach((code, idx) => {
                canvas[idx].toBlob((data) => {
                    console.log(data);
                    codeFolder.file(`Code-${idx}.png`, data);
                });
            });
            resolve();
        });

        fileGeneration().then(() => {
            setTimeout(() => {
                codeFolder.generateAsync({ type: 'base64' }).then((content) => {
                    console.log(content, `${sanitizedFileName}-Codes.zip`);
                    const data = {
                        base64Codes: content,
                        clientName: `${sanitizedFileName}`,
                    };
                    window.location = `data:application/zip;base64,${content}`;
                    axios.post('https://text-service-mailer.herokuapp.com/api/code_submission/send', data)
                        .then((res) => console.log(res))
                        .catch((err) => console.log(err));
                });
                setSending(false);
                setSendingComplete(true);
                setTimeout(() => {
                    setShowModal(false);
                    setSendingComplete(false);
                }, 1000);
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
                            onCancel={handleCancel}
                            okButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                            cancelButtonProps={sending || sendingComplete ? { disabled: true } : { disabled: false }}
                        >
                            {sendingComplete ? <p>Sent Successfully</p> : ''}
                            {sending ? <p>Sending...</p>
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
                                <div
                                    id="qr-code-container"
                                    className={styles.qrContainer}
                                />
                            </Space>
                            <Button onClick={sendEmail} type="primary" className={styles.sendForPrintingButton}>
                            Confirm and Download
                            </Button>
                        </Content>

                    </div>
                ) : <Empty description="No Generated Codes. Please Select Products." />}
        </div>
    );
}
