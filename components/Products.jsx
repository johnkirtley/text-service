import { useState, useEffect } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox,
} from 'antd';

import Image from 'next/image';

const { Content } = Layout;

const sampleProducts = ['Windshield Fluid', 'Oil', 'Paper Towels', 'Gasoline', 'Wax', 'Water Bottles'];

export default function Products({ repContact }) {
    const [products, setProducts] = useState(sampleProducts);
    const [newProduct, setNewProduct] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [qrCodes, setQRCodes] = useState([]);
    const [qrLinks, setQrLinks] = useState([]);

    const handleChange = (e) => {
        setNewProduct(e.target.value);
    };

    const addProduct = () => {
        if (newProduct.length > 0) {
            if (!products.includes(newProduct)) {
                products.push(newProduct);
                setNewProduct('');
            } else {
                setNewProduct('');
                alert('Product Already Added');
            }
        }
    };

    const handleCustomerChange = (e) => {
        setCustomerName(e.target.value);
    };

    const onCheckChange = (e) => {
        if (e.target.checked) {
            selectedProducts.push(e.target.value);
        }

        if (!e.target.checked) {
            setSelectedProducts(selectedProducts.filter((p) => p !== e.target.value));
        }
        // setCheckedList(list);
        // setIndeterminate(!!list.length && list.length < products.length);
        // setCheckAll(list.length === products.length);
    };
    const generateCodes = () => {
        if (customerName.length < 1) {
            alert('Please Add Customer Name');
            return;
        }

        if (selectedProducts.length < 1) {
            alert('Please Select Products');
            return;
        }

        if (repContact.length < 1) {
            alert('Head To Settings To Add Contact Number');
            return;
        }

        const links = selectedProducts.map((product) => {
            const trimmedCustomerName = customerName.replace(' ', '%20');
            const message = `${product}%20to%20${trimmedCustomerName}`;
            const trimmed = message.replace(' ', '%20');
            const data = { name: product, src: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMSTO:${repContact}:${trimmed}` };
            qrLinks.push(data.src);
            return data;
        });

        setQRCodes(links);
    };

    // api call for QR Code
    // https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMSTO:7024437014:${message}

    return (
        <>
            <PageHeader title="Product and QR Code Page" />
            <Content style={{ width: '100%' }}>
                <Space direction="vertical" size="large">
                    <Input placeholder="Enter Customer Name" name="customerName" onChange={handleCustomerChange} type="text" value={customerName} />
                    <Space>
                        <Input placeholder="Enter Product Name" name="newProduct" onChange={handleChange} type="text" value={newProduct} />
                        <Button type="primary" onClick={addProduct}>Add</Button>
                    </Space>
                </Space>
            </Content>
            <Button type="primary" onClick={generateCodes} style={{ marginBottom: '2rem' }}>Generate QR Codes</Button>
            <Content style={{
                display: 'flex', justifyContent: 'flex-start', flexFlow: 'column', marginBottom: '6rem',
            }}
            >
                {products.map((product, idx) => (
                    <Space key={idx} style={{ justifyContent: 'space-between', marginBottom: '1rem' }} size="large">
                        <Checkbox
                            value={product}
                            onChange={onCheckChange}
                        >
                            {product}
                        </Checkbox>
                    </Space>
                ))}
            </Content>
            <div>
            Generated Codes
            </div>
            <Content style={{
                display: 'grid', margin: '0 2rem', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem',
            }}
            >
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
        </>
    );
}
