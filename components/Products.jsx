import { useState, useContext } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox,
} from 'antd';
import { RepContext, ClientContext } from '../Context/Context';

// Helper Functions
import { handleTextChange, generateCanvasImg } from '../utils/helpers';
import QRCode from './QRCode';

const { Content } = Layout;

const sampleProducts = ['Windshield Fluid', 'Oil', 'Paper Towels', 'Gasoline', 'Wax', 'Water Bottles'];

export default function Products() {
    const [products] = useState(sampleProducts);
    const [newProduct, setNewProduct] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    // const [customerName, setCustomerName] = useState('');
    const [qrCodes, setQRCodes] = useState([]);

    const { repInfo } = useContext(RepContext);
    const { clientInfo, setClientInfo } = useContext(ClientContext);

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
        if (clientInfo.length < 1) {
            alert('Please Add Customer Name');
            return;
        }

        if (selectedProducts.length < 1) {
            alert('Please Select Products');
            return;
        }

        if (repInfo.length < 1) {
            alert('Head To Settings To Add Contact Number');
            return;
        }

        const links = selectedProducts.map((product) => {
            const trimmedCustomerName = clientInfo.replace(' ', '%20');
            const message = `${product}%20to%20${trimmedCustomerName}`;
            const trimmed = message.replace(' ', '%20');
            const codeString = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMSTO:${repInfo}:${trimmed}`;
            return { name: product, src: codeString };
        });

        setQRCodes(links);

        links.forEach((link) => {
            generateCanvasImg(link.src, link.name);
        });
    };

    // api call for QR Code
    // https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMSTO:7024437014:${message}

    return (
        <>
            <PageHeader title="Product and QR Code Page" />
            <Content style={{ width: '100%' }}>
                <Space direction="vertical" size="large">
                    <Input placeholder="Enter Customer Name" name="customerName" onChange={(e) => handleTextChange(e, setClientInfo)} type="text" value={clientInfo} />
                    <Space>
                        <Input placeholder="Enter Product Name" name="newProduct" onChange={(e) => handleTextChange(e, setNewProduct)} type="text" value={newProduct} />
                        <Button type="primary" onClick={addProduct}>Add</Button>
                    </Space>
                </Space>
            </Content>
            <Button type="primary" onClick={generateCodes} style={{ marginBottom: '2rem' }}>Generate QR Codes</Button>
            <Content style={{ display: 'flex', justifyContent: 'flex-start', flexFlow: 'column', marginBottom: '6rem' }}>
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
            <QRCode qrCodes={qrCodes} />
        </>
    );
}
