/* eslint-disable max-len */
import { useState, useContext } from 'react';
import JSZip from 'jszip';
import {
    Layout, Space, Empty, Button, Modal,
} from 'antd';
// import { saveAs } from 'file-saver';
import axios from 'axios';
import ClientContext from '../Context/ClientContext';

const { Content } = Layout;

export default function QRCode({ qrCodes }) {
    const { clientInfo } = useContext(ClientContext);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendingComplete, setSendingComplete] = useState(false);

    const sanitizedFileName = clientInfo.replace(' ', '-');
    const zipImages = () => {
        setSending(true);
        const zip = new JSZip();
        const codeFolder = zip.folder('QR-Codes');
        const canvas = Array.from(document.querySelector('.qr-code-container').children);

        const fileGeneration = () => new Promise((resolve) => {
            qrCodes.forEach((code, idx) => {
                canvas[idx].toBlob((data) => {
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
                    axios.post('https://text-service-mailer.herokuapp.com/api/code_submission/send', data)
                        .then((res) => console.log(res))
                        .catch((err) => console.log(err));
                });
                setSending(false);
                setSendingComplete(true);
                setTimeout(() => {
                    setShowModal(false);
                    setSendingComplete(false);
                }, 2000);
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
        <div>
            {qrCodes.length > 0
                ? (
                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Generated Codes
                        </p>
                        <Modal title="QR Code Confirmation" open={showModal} onOk={handleOk} onCancel={handleCancel}>
                            {sendingComplete ? <p>Sent Successfully</p> : ''}
                            {sending ? <p>Sending...</p>
                                : (
                                    <>
                                        <p>Total Codes: {qrCodes.length}</p>
                                        <p>Selected Products:</p>
                                        {qrCodes.map((code, idx) => (
                                            <p key={idx}>{code.name}</p>
                                        ))}
                                    </>
                                ) }
                        </Modal>
                        <Button onClick={sendEmail} type="primary">
                            Confirm and Send For Printing
                        </Button>
                        <Content style={{ marginBottom: '2rem' }}>
                            <Space style={{ justifyContent: 'space-between', marginBottom: '1rem', marginTop: '2rem' }} size="large">
                                <div
                                    className="qr-code-container"
                                    style={{
                                        display: 'flex', overflowY: 'scroll', height: '40rem', flexFlow: 'column', gap: '3rem', width: '100%', margin: 'auto', scale: '70%',
                                    }}
                                >
                                    {/* {codeInfo.name} */}
                                    {/* <a href={codeInfo.src} target="_blank" download={`${codeInfo.name}.jpg`} rel="noreferrer">
                                                <Image layout="intrinsic" width={150} height={150} src={codeInfo.src} alt={codeInfo.name} />
                                            </a> */}
                                </div>
                            </Space>
                        </Content>
                    </div>
                ) : <Empty description="No Generated Codes" />}
        </div>
    );
}
