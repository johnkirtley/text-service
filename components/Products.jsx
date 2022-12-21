import { useState, useContext, useEffect, useCallback } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox, Spin, Select,
} from 'antd';
import {
    doc, updateDoc, arrayUnion, query, where, getDocs, collection, arrayRemove,
} from 'firebase/firestore';
import { firestore } from '../firebase/clientApp';
import {
    RepContext, ClientContext, CustomerContext, BusinessNameContext, AuthContext,
} from '../Context/Context';

// Helper Functions
import { handleTextChange, generateCanvasImg } from '../utils/helpers';
import QRCode from './QRCode';

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
    const [loadings, setLoadings] = useState([]);

    useEffect(() => {
        setCurProducts(customerInfo.products);
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

    const enterLoading = (index) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            loadings[index] = true;
            return newLoadings;
        });
    };

    const removeProduct = async (val, id) => {
        enterLoading(id);
        const prodRemoveRef = doc(firestore, 'users', authContext.email);
        const dataToRemove = val;

        await updateDoc(prodRemoveRef, { products: arrayRemove(dataToRemove) });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[id] = false;
                const filtered = curProducts.filter((prod) => prod !== val);

                setTimeout(() => {
                    setCurProducts(filtered);
                }, 0);
                return newLoadings;
            });
        }, 1500);
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
            <Content style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
                <Space direction="vertical" size="large" style={{ minWidth: '18rem', gap: '1rem' }}>
                    <div style={{
                        marginBottom: '1rem', display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', width: '16rem', gap: '0.5rem',
                    }}
                    >
                        <p className="input-label">Who Are These For?</p>
                        <Input placeholder="Enter Customer Name" name="customerName" onChange={(e) => handleTextChange(e, setClientInfo)} type="text" value={clientInfo} />
                    </div>
                    <Space style={{ minWidth: '18rem' }}>
                        <div style={{
                            marginBottom: '1rem', display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', width: '16rem', gap: '0.5rem',
                        }}
                        >
                            <p className="input-label">Select a Rep</p>

                            <Select
                                defaultValue="Select a Rep"
                                style={{ width: 'inherit' }}
                                onChange={handleRepChange}
                                options={repOptions}
                            />
                        </div>
                    </Space>
                </Space>

            </Content>
            <Content style={{
                display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-start', textAlign: 'center', marginBottom: '6rem', width: '100%', padding: '0 2rem', marginTop: '5rem',
            }}
            >
                <div style={{ flexFlow: 'column', minWidth: '18rem' }}>
                    {curProducts && curProducts.length > 0
                        ? (
                            <div>
                                <div className="input-label" style={{ marginBottom: '2rem' }}>
                Select Products Below:
                                </div>

                                <div style={{ overflowY: 'scroll', flexFlow: 'column', display: 'flex', height: '14rem' }}>
                                    {curProducts.map((product, idx) => (
                                        <Space key={idx} style={{ justifyContent: 'space-between', marginBottom: '1rem', width: '100%', display: 'flex' }} size="large">
                                            <Checkbox
                                                value={product}
                                                onChange={onCheckChange}
                                                style={{ width: '100%' }}
                                            >
                                                <span style={{
                                                    width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '2rem', alignItems: 'center',
                                                }}
                                                >
                                                    {product}
                                                    <Button type="primary" loading={loadings[idx]} danger onClick={() => removeProduct(product, idx)}>Remove</Button>
                                                </span>
                                            </Checkbox>
                                        </Space>
                                    ))}
                                </div>
                                <Space />
                                <Button type="primary" onClick={generateCodes} style={{ margin: '2rem 0', maxWidth: '13rem' }}>Generate QR Codes</Button>

                            </div>
                        )
                        : (
                            <div style={{
                                marginBottom: '4rem', display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', width: '16rem', gap: '0.5rem',
                            }}
                            >
                                <p>No products found. Please Add Some below.</p>
                            </div>
                        )}
                    <div style={{
                        marginBottom: '4rem', display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                    }}
                    >
                        <p className="input-label">Add a Product</p>
                        <Input placeholder="Enter Product Name" name="newProduct" onChange={(e) => handleTextChange(e, setNewProduct)} type="text" value={newProduct} />
                        <Button type="primary" onClick={() => addProduct(newProduct)}>Add</Button>
                    </div>

                </div>
                <div style={{ minWidth: '18rem' }}>
                    <p className="input-label">
                            Generated Codes
                    </p>
                    {loading ? <Spin tip="Working Our Magic" style={{ marginTop: '4rem' }} /> : ''}
                    <QRCode qrCodes={qrCodes} loading={loading} />
                </div>
            </Content>

        </>
    );
}
