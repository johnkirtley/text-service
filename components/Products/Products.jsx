import { useState, useContext, useEffect, useCallback } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox, Spin, Select,
} from 'antd';
import {
    doc, updateDoc, arrayUnion, query, where, getDocs, collection, arrayRemove,
} from 'firebase/firestore';
import styles from './Products.module.css';
import { firestore } from '../../firebase/clientApp';
import {
    RepContext, ClientContext, CustomerContext, BusinessNameContext, AuthContext,
} from '../../Context/Context';

// Helper Functions
import { handleTextChange, generateCanvasImg } from '../../utils/helpers';
import QRCode from '../QrCodes/QRCode';

// styles

const { Content } = Layout;

export default function Products() {
    const [newProduct, setNewProduct] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedRep, setSelectedRep] = useState('');
    const [repOptions, setRepOptions] = useState([]);
    // const [customerName, setCustomerName] = useState('');
    const [qrCodes, setQRCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { businessName } = useContext(BusinessNameContext);
    const { authContext } = useContext(AuthContext);

    const { repInfo } = useContext(RepContext);
    const { clientInfo, setClientInfo } = useContext(ClientContext);
    const { customerInfo } = useContext(CustomerContext);
    const [curProducts, setCurProducts] = useState([]);

    useEffect(() => {
        if (customerInfo.products) {
            setCurProducts(customerInfo.products);
        }
    }, [customerInfo.products]);

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('email', '==', authContext.email));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
            if (document.data().email === authContext.email) {
                setCurProducts(document.data().products);
            }
        });
    }, [authContext?.email]);

    const addProduct = async (val) => {
        if (val && val.length > 0) {
            if (curProducts && !curProducts.includes(val)) {
                const productRef = doc(firestore, 'users', authContext.email);

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
        const prodRemoveRef = doc(firestore, 'users', authContext.email);
        const dataToRemove = val;

        await updateDoc(prodRemoveRef, { products: arrayRemove(dataToRemove) });

        const filtered = curProducts.filter((prod) => prod !== val);
        setCurProducts(filtered);
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

        setLoading(true);

        const links = selectedProducts.map((product) => {
            const trimmedCustomerName = clientInfo.replace(' ', '%20');
            const message = `${product}%20to%20${trimmedCustomerName}`;
            const trimmed = message.replace(' ', '%20');
            const codeString = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SMSTO:${selectedRep}:${trimmed}`;
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

    // const saveContact = (num) => {
    //     // backend api call to store phone number in DB
    //     const sanitizedNum = num.replace(/^(\+)|\D/g, '$1');

    //     setRepInfo(sanitizedNum);
    // };

    // const onChange = (value) => {
    //     console.log(`selected ${value}`);
    //     setRepInfo(value);
    // };

    // const onSearch = (value) => {
    //     console.log('search:', value);
    // };

    // const repNumbers = [
    //     {
    //         value: '702-281-5940',
    //         label: 'Jack',
    //     },
    //     {
    //         value: '702-616-2339',
    //         label: 'Lucy',
    //     },
    //     {
    //         value: '702-443-7014',
    //         label: 'Tom',
    //     },
    // ];

    // api call for QR Code
    // https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMSTO:7024437014:${message}

    const handleRepChange = (val) => {
        setSelectedRep(val);
    };

    useEffect(() => {
        const newArr = repInfo.map((rep) => ({ value: rep.number, label: `${rep.name} - ${rep.number}` }));

        setRepOptions(newArr);
    }, [repInfo]);

    useEffect(() => {
        if (authContext) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [authContext, getQuery]);

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
                                <Button type="primary" onClick={generateCodes} className={styles.generateCodesButton}>Generate QR Codes</Button>

                            </div>
                        )
                        : (
                            <div className={styles.noProducts}>
                                <p>No products found. Please Add Some below.</p>
                            </div>
                        )}
                    <div className={styles.addProductContainer}>
                        <p className="input-label">Add a Product</p>
                        <Input placeholder="Enter Product Name" name="newProduct" onChange={(e) => handleTextChange(e, setNewProduct)} type="text" value={newProduct} />
                        <Button type="primary" onClick={() => addProduct(newProduct)}>Add</Button>
                    </div>

                </div>
                <div className={styles.productInfoInputs}>
                    <p className="input-label">
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
