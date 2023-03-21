import { useState, useContext, useEffect } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox, Spin, Select, Collapse,
} from 'antd';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import styles from './Products.module.css';
import { firestore } from '../../firebase/clientApp';
import {
    RepContext, ClientContext, BusinessNameContext, ProductContext, OwnerIdContext,
} from '../../Context/Context';
import { useAuth } from '../../Context/AuthContext';
// Helper Functions
import { handleTextChange, generateCanvasImg } from '../../utils/helpers';
import QRCode from '../QrCodes/QRCode';
import usePremiumStatus from '../../stripe/usePremiumStatus';

// styles

const { Content } = Layout;
const { Panel } = Collapse;

export default function Products() {
    const [newProduct, setNewProduct] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedRep, setSelectedRep] = useState('');
    const [repOptions, setRepOptions] = useState([]);
    // const [customerName, setCustomerName] = useState('');
    const [qrCodes, setQRCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { businessName } = useContext(BusinessNameContext);
    const { curProducts, setCurProducts } = useContext(ProductContext);
    const { user } = useAuth();

    const { repInfo } = useContext(RepContext);
    const { clientInfo, setClientInfo } = useContext(ClientContext);
    const { ownerId } = useContext(OwnerIdContext);

    const { planName } = usePremiumStatus(user);

    const addProduct = async (val) => {
        if (val && val.length > 0) {
            if (curProducts && !curProducts.includes(val)) {
                const productRef = doc(firestore, 'users', user.email);

                await updateDoc(productRef, { products: arrayUnion(val) });

                setCurProducts((oldProducts) => [...oldProducts, val]);
                setNewProduct('');
            } else {
                setNewProduct('');
                alert('Product Already Added');
            }
        }
    };

    const removeProduct = async (val) => {
        const prodRemoveRef = doc(firestore, 'users', user.email);
        const dataToRemove = val;

        await updateDoc(prodRemoveRef, { products: arrayRemove(dataToRemove) });

        // const filteredCur = curProducts.filter((prod) => prod !== val);
        const filteredSelect = selectedProducts.filter((prod) => prod !== val);

        const copyArr = [...curProducts];
        const index = copyArr.indexOf(val);

        if (index !== -1) {
            copyArr.splice(index, 1);

            console.log(copyArr);

            setCurProducts(copyArr);
        }
        setSelectedProducts(filteredSelect);
        // setCurProducts(filteredCur);
    };

    const onCheckChange = (e, product) => {
        if (e.target.checked) {
            selectedProducts.push(product);
        }

        if (!e.target.checked) {
            setSelectedProducts(selectedProducts.filter((p) => p !== product));
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

        if (selectedRep.length < 1) {
            alert('Please Select a Rep');
            return;
        }

        if (businessName.length < 1) {
            alert('Please Add Your Business Name Under Settings');
            return;
        }

        if (planName === '') {
            return;
        }

        setLoading(true);

        const links = selectedProducts.map((product) => {
            const trimmedCustomerName = clientInfo.replace(' ', '%20');
            // const message = `${product}%20to%20${trimmedCustomerName}`;
            // const trimmed = message.replace(' ', '%20');
            const url = encodeURIComponent(`https://app.physicalmint.com/submit?product=${product}&rep=${selectedRep}&clientName=${trimmedCustomerName}&ownerName=${businessName}&id=${ownerId}`);
            const codeString = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`;
            return { name: product, src: codeString };
        });

        setQRCodes(links);

        links.forEach((link) => {
            generateCanvasImg(link.src, link.name, businessName);
            // add company name above QR code
        });

        setTimeout(() => {
            setLoading(false);
        }, 4000);
    };

    const handleRepChange = (val) => {
        setSelectedRep(val);
    };

    useEffect(() => {
        const newArr = repInfo.map((rep) => ({ value: rep.number, label: `${rep.name} - ${rep.number}` }));

        setRepOptions(newArr);
    }, [repInfo]);

    // this is firing twice causing 2 network calls ?????
    // Firebase subscription listeners??
    // useEffect(() => {
    //     if (authContext) {
    //         const colRef = collection(firestore, 'users');
    //         getQuery(colRef);
    //     }
    // }, [authContext, getQuery]);

    return (
        <>
            <PageHeader title="" />
            <Content className={styles.contentContainer}>
                <Space direction="vertical" size="large" className={styles.productInfoInputs}>
                    <div className={styles.infoInput}>
                        <p className={styles.inputLabel}>Who Are These For?</p>
                        <Input placeholder="Enter Customer Name" name="customerName" onChange={(e) => handleTextChange(e, setClientInfo)} type="text" value={clientInfo} />
                    </div>
                    <Space className={styles.productInfoInputs}>
                        <div className={styles.infoInput}>
                            <p className="input-label">Select a Rep</p>

                            <Select
                                defaultValue="Select a Rep"
                                className={styles.selectRep}
                                onChange={handleRepChange}
                                options={repOptions}
                            />
                        </div>
                    </Space>
                </Space>

            </Content>
            <Content className={styles.productContainer}>
                <div className={styles.productContainerDiv}>

                    {curProducts && curProducts.length > 0
                        ? (
                            <div>
                                <div className={styles.selectProductsLabel}>
                Select Products Below:
                                </div>

                                <div className={styles.productScroll}>
                                    {curProducts.map((product, idx) => (
                                        <Space
                                            key={idx}
                                            className={styles.product}
                                            size="large"
                                        >
                                            <Checkbox
                                            // if box is checked, disable remove button
                                                onChange={(e) => onCheckChange(e, product)}
                                            >
                                                {product}
                                            </Checkbox>
                                            <span className={styles.productRemove}>
                                                <Button type="primary" danger onClick={() => removeProduct(product)}>Remove</Button>
                                            </span>
                                        </Space>
                                    ))}
                                </div>
                                <Space />
                                <Button type="primary" onClick={generateCodes} disabled={planName === '' ? true : ''} className={styles.generateCodesButton}>Generate QR Codes</Button>

                            </div>
                        )
                        : (
                            <div className={styles.noProducts}>
                                <p>No products found. Please Add Some below.</p>
                            </div>
                        )}
                    <div className={styles.addProductContainer}>
                        <Collapse>
                            <Panel header="Add New Product">
                                <div className={styles.addProductPanel}>
                                    <Input placeholder="Enter Product Name" name="newProduct" onChange={(e) => handleTextChange(e, setNewProduct)} type="text" value={newProduct} />
                                    <Button type="primary" onClick={() => addProduct(newProduct)}>Add</Button>
                                </div>
                            </Panel>
                        </Collapse>
                    </div>

                </div>
                <div className={styles.productInfoInputs}>
                    <p className={styles.generatedCodes}>
                            Generated Codes
                    </p>
                    {loading ? <Spin tip="Working Our Magic" className={styles.codesLoading} /> : ''}
                    <QRCode
                        qrCodes={qrCodes}
                        loading={loading}
                        selectedRep={selectedRep}
                        repOptions={repOptions}
                    />
                </div>

            </Content>

        </>
    );
}
