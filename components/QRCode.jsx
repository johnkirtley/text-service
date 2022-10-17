/* eslint-disable max-len */
import { useContext } from 'react';
import JSZip from 'jszip';
import { Layout, Space, Empty, Button } from 'antd';
import { saveAs } from 'file-saver';
import ClientContext from '../Context/ClientContext';

const { Content } = Layout;

export default function QRCode({ qrCodes }) {
    const { clientInfo } = useContext(ClientContext);

    const sanitizedFileName = clientInfo.replace(' ', '-');
    const zipImages = () => {
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
                codeFolder.generateAsync({ type: 'blob' }).then((content) => saveAs(content, `${sanitizedFileName}-Codes.zip`));
            }, 2000);
        });
    };

    return (
        <div>
            {qrCodes.length > 0
                ? (
                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Generated Codes
                        </p>
                        <Button onClick={zipImages}>
                            Download All
                        </Button>
                        <Content style={{ marginBottom: '2rem' }}>
                            <Space style={{ justifyContent: 'space-between', marginBottom: '1rem', marginTop: '2rem' }} size="large">
                                <div
                                    className="qr-code-container"
                                    style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridGap: '1rem', width: '75%', margin: 'auto',
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
