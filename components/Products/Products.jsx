/* eslint-disable max-len */
/* eslint-disable sonarjs/cognitive-complexity */
import { useState, useContext, useEffect } from 'react';
import {
    Layout, Input, PageHeader, Space, Button, Checkbox, Spin, Select, Collapse, Steps, Empty, Alert,
} from 'antd';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import styles from './Products.module.css';
import { firestore } from '../../firebase/clientApp';
import {
    RepContext, ClientContext, BusinessNameContext, ProductContext, OwnerIdContext, SelectedContext,
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
    const { setSelectedProducts } = useContext(SelectedContext);
    const [selectedRep, setSelectedRep] = useState('');
    const [repOptions, setRepOptions] = useState([]);
    // const [customerName, setCustomerName] = useState('');
    const [qrCodes, setQRCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(0);
    const [productAdded, setProductAdded] = useState(false);
    const [productRemoved, setProductRemoved] = useState(false);
    const [alreadyAdded, setAlreadyAdded] = useState(false);
    const [searchProduct, setSearchProduct] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const { businessName } = useContext(BusinessNameContext);
    const { curProducts, setCurProducts } = useContext(ProductContext);
    const { user } = useAuth();

    const { repInfo } = useContext(RepContext);
    const { clientInfo, setClientInfo } = useContext(ClientContext);
    const { ownerId } = useContext(OwnerIdContext);

    const { planName } = usePremiumStatus(user?.email);

    const next = () => {
        setCurrent(current + 1);
        setSearchProduct('');
    };

    const previous = () => {
        setCurrent(current - 1);
        setSelectedProducts([]);
        setQRCodes([]);

        if (current === 1) {
            setSelectedRep('');
        }
    };

    const handleProductSearch = (e) => {
        const searchValue = e.target.value;
        setSearchProduct(searchValue);
    };

    useEffect(() => {
        const filtered = curProducts.filter((prod) => prod.product.toLowerCase().includes(searchProduct.toLowerCase()));

        if (searchProduct.trim() === '') {
            setFilteredProducts(curProducts);
        } else {
            setFilteredProducts(filtered);
        }
    }, [searchProduct, curProducts]);

    const steps = [
        { title: 'Configure' },
        { title: 'Select Products' },
        { title: 'Generate QR Codes' },
    ];

    const addProduct = async (val) => {
        const noDupes = curProducts.some((product) => product.product.toLowerCase() === val.toLowerCase());
        if (val && val.length > 0) {
            if (curProducts && !noDupes) {
                const productRef = doc(firestore, 'users', user.email);

                await updateDoc(productRef, { products: arrayUnion(val) });

                setCurProducts((oldProducts) => [{ product: val, isChecked: false }, ...oldProducts]);
                setProductAdded(true);

                setTimeout(() => {
                    setProductAdded(false);
                }, 1500);
                setNewProduct('');
            } else {
                setNewProduct('');
                setAlreadyAdded(true);
                setTimeout(() => {
                    setAlreadyAdded(false);
                }, 1500);
            }
        }
    };

    const removeProduct = async (val) => {
        const prodRemoveRef = doc(firestore, 'users', user.email);
        const dataToRemove = val;

        await updateDoc(prodRemoveRef, { products: arrayRemove(dataToRemove) });

        // const filteredCur = curProducts.filter((prod) => prod !== val);
        const filteredSelect = curProducts.filter((prod) => prod.product.toLowerCase() !== val.toLowerCase());

        const copyArr = [...curProducts];
        const index = copyArr.indexOf(val);

        if (index !== -1) {
            copyArr.splice(index, 1);

            setCurProducts(copyArr);
        }
        setProductRemoved(true);
        setCurProducts(filteredSelect);
        // setCurProducts(filteredCur);

        setTimeout(() => {
            setProductRemoved(false);
        }, 1500);
    };

    const onCheckChange = (product, idx) => {
        let newArr;

        if (filteredProducts.length > 0) {
            newArr = [...filteredProducts];
        } else {
            newArr = [...curProducts];
        }

        newArr[idx].isChecked = !newArr[idx].isChecked;

        if (newArr[idx].isChecked) {
            setSelectedProducts([...newArr, { product, isChecked: newArr[idx].isChecked }]);
        }

        if (!newArr[idx].isChecked) {
            const filter = newArr.map((prod) => prod !== product);
            setSelectedProducts(filter);
        }
    };

    const checkActive = () => curProducts.some((obj) => obj.isChecked);

    const generateCodes = () => {
        if (clientInfo.length < 1) {
            alert('Please Add Customer Name');
            return;
        }

        if (!checkActive) {
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
        const checkedItems = curProducts.filter((product) => product.isChecked === true);

        const links = checkedItems.map((product) => {
            const trimmedCustomerName = clientInfo.replace(/ /g, '%20');
            const url = encodeURIComponent(`https://app.supplymate.io/submit?product=${product.product}&rep=${selectedRep}&clientName=${trimmedCustomerName.toLowerCase()}&ownerName=${businessName}&id=${ownerId}`);
            const codeString = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`;
            return { name: product.product, src: codeString, businessName };
        });

        setQRCodes(links);

        setTimeout(() => {
            document.querySelector('#qr-code-container').innerHTML = '';

            generateCanvasImg(links).then((arr) => {
                arr.forEach((canvas) => {
                    document.querySelector('#qr-code-container').appendChild(canvas);
                });
            });
        }, 10);

        setTimeout(() => {
            setLoading(false);
        }, 5000);
    };

    const handleRepChange = (val) => {
        setSelectedRep(val);
    };

    useEffect(() => {
        const newArr = repInfo.map((rep) => ({ value: rep.id, label: `${rep.name} - ${rep.number}` }));

        setRepOptions(newArr);
    }, [repInfo]);

    return (
        <>
            <PageHeader title="" />
            <Steps current={current}>
                {steps.map((step, index) => (
                    <Steps.Step key={index} title={step.title} />
                ))}

            </Steps>
            {productAdded ? <Alert message="Product Successfully Added" type="success" /> : ''}
            {productRemoved ? <Alert message="Product Successfully Removed" type="warning" /> : ''}
            {alreadyAdded ? <Alert message="Product Already Added" type="error" /> : ''}
            {current === 0 ? (
                <Space>
                    <Content className={styles.contentContainer}>
                        <Space direction="vertical" size="large" className={styles.productInfoInputs} style={{ padding: '1rem 3rem', boxShadow: '18px 13px 36px 7px rgb(77 77 77 / 18%), 39px 1px 26px -39px rgb(77 77 77 / 4%)', borderRadius: '10px' }}>
                            <div className={styles.configInputs}>
                                <div className={styles.infoInput}>
                                    <p className={styles.inputLabel}>QR Code Location</p>
                                    <Input placeholder="Enter location name..." name="customerName" onChange={(e) => handleTextChange(e, setClientInfo)} type="text" value={clientInfo} />
                                </div>
                                <Space className={styles.productInfoInputs}>
                                    <div className={styles.infoInput}>
                                        <p className="input-label">Set Notification Number</p>

                                        <Select
                                            defaultValue="Select a number..."
                                            className={styles.selectRep}
                                            onChange={handleRepChange}
                                            options={repOptions}
                                        />
                                    </div>
                                </Space>
                            </div>
                        </Space>
                    </Content>
                </Space>

            ) : ''}
            {current === 1 ? (
                <Space>
                    <Content className={styles.productContainer}>
                        <div className={styles.productContainerDiv}>

                            {curProducts && curProducts.length > 0
                                ? (
                                    <div>
                                        <div className={styles.selectProductsLabel}>
                Select Products Below:
                                        </div>
                                        <Input placeholder="Search For A Product..." value={searchProduct} name="searchProduct" onChange={handleProductSearch} className={styles.searchProducts} />

                                        <div className={styles.productScroll}>
                                            {filteredProducts.map((product, idx) => (
                                                <Space
                                                    key={idx}
                                                    className={styles.product}
                                                    size="large"
                                                >
                                                    <Checkbox
                                                        // if box is checked, disable remove button
                                                        onChange={() => onCheckChange(product, idx)}
                                                        checked={product.isChecked}
                                                    >
                                                        {product.product}
                                                    </Checkbox>
                                                    <span className={styles.productRemove}>
                                                        <Button type="primary" danger onClick={() => removeProduct(product.product)}>Remove</Button>
                                                    </span>
                                                </Space>
                                            ))}
                                        </div>
                                        <Space />
                                    </div>
                                )
                                : (
                                    <div className={styles.noProducts}>
                                        <Empty description={<span className={styles.noProductSpan}>No Products Found. Please Add Some Below.</span>} />
                                    </div>
                                )}
                            <div className={styles.addProductContainer}>
                                <Collapse defaultActiveKey={curProducts.length < 1 ? '1' : ''}>
                                    <Panel header="Add New Product" key="1">
                                        <div className={styles.addProductPanel}>
                                            <Input maxLength={40} placeholder="Enter Product Name" name="newProduct" onChange={(e) => handleTextChange(e, setNewProduct)} type="text" value={newProduct} />
                                            <Button type="primary" onClick={() => addProduct(newProduct)}>Add</Button>
                                        </div>
                                    </Panel>
                                </Collapse>
                            </div>

                        </div>

                    </Content>
                </Space>
            ) : ''}
            {current === 2 ? (
                <Space>

                    <div className={styles.generatedCodesContainer}>

                        {loading ? <><span className={styles.overlay} /><Space wrap className={styles.spinnerBackground}><Spin tip="Generating Codes. Please Wait..." size="large" className={styles.codesLoading} /></Space> </>
                            : ''}
                        <QRCode
                            qrCodes={qrCodes}
                            loading={loading}
                            selectedRep={selectedRep}
                            repOptions={repOptions}
                            checkActive={checkActive}
                            setCurrent={setCurrent}
                            setSelectedRep={setSelectedRep}
                            setClientInfo={setClientInfo}
                            setQRCodes={setQRCodes}
                            setSelectedProducts={setSelectedProducts}
                        />
                        {loading ? '' : <Button type="primary" onClick={generateCodes} disabled={planName === '' ? true : ''} className={styles.generateCodesButton}>{!checkActive() || qrCodes.length > 0 ? '' : 'Generate QR Codes'}</Button> }
                    </div>
                </Space>
            ) : ''}

            <div className={styles.prevNextButtons}>
                {current > 0 && !loading ? <Button onClick={previous}>Prev</Button> : ''}
                {current === 0 ? <Button type="primary" disabled={!selectedRep || !clientInfo ? true : ''} onClick={next}>Next</Button> : ''}
                {current === 1 ? <Button type="primary" disabled={!checkActive() ? true : ''} onClick={next}>Next</Button> : ''}
                {/* {current === steps.length - 1 ? <Button type="primary" onClick={reset}>Done</Button> : ''} */}
            </div>
        </>
    );
}
