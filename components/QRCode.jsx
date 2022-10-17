import Image from 'next/image';
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
                        <Content style={{ display: 'grid', margin: '0 2rem', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
                            {qrCodes.map((codeInfo, idx) => (
                                <Space key={idx} style={{ justifyContent: 'space-between', marginBottom: '1rem', marginTop: '2rem' }} size="large">
                                    <div
                                        className="qr-code-container"
                                        style={{
                                            display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 2rem',
                                        }}
                                    >
                                        {codeInfo.name}
                                        <div>
                                            <a href={codeInfo.src} target="_blank" download={`${codeInfo.name}.jpg`} rel="noreferrer">
                                                <Image layout="intrinsic" width={150} height={150} src={codeInfo.src} alt={codeInfo.name} />
                                            </a>
                                        </div>
                                    </div>
                                </Space>
                            ))}
                        </Content>
                    </div>
                ) : <Empty description="No Generated Codes" />}
        </div>
    );
}
