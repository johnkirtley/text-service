/* eslint-disable max-len */
// import Image from 'next/image';
import { Layout, Space, Empty } from 'antd';

const { Content } = Layout;

export default function QRCode({ qrCodes }) {
    return (
        <div>
            {qrCodes.length > 0
                ? (
                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Generated Codes
                        </p>
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
