/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
import { useState, useEffect, useCallback, useContext } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import Image from 'next/image';
import {
    Layout, Space, Spin, Empty, Statistic, Table, Input,
} from 'antd';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

import { firestore } from '../../firebase/clientApp';
import { useAuth } from '../../Context/AuthContext';

import OwnerIdContext from '../../Context/OwnerIdContext';
import usePremiumStatus from '../../stripe/usePremiumStatus';

// import padlock from '../../public/icons/padlock.png';

import styles from './HomeComponent.module.css';

const defaultMonths = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec'];

export default function Home() {
    const [scanArr, setScanArr] = useState([]);
    const [restockArr, setRestockArr] = useState([]);
    const [largestRestock, setLargestRestock] = useState('');
    const [productTableData, setProductTableData] = useState([]);
    const [clientTableData, setClientTableData] = useState([]);
    const [filterProductTable, setFilterProductTable] = useState([]);
    const [filterClientTable, setFilterClientTable] = useState([]);
    const [tableProductSearch, setTableProductSearch] = useState('');
    const [tableClientSearch, setTableClientSearch] = useState('');
    // const [setLargestScan] = useState('');
    const [clientRestock, setClientRestock] = useState(null);
    const [months] = useState(defaultMonths);
    const [chartDateData, setChartDateData] = useState([]);
    const { ownerId } = useContext(OwnerIdContext);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const isUserPremium = usePremiumStatus(user.email);

    const { Content } = Layout;

    Chart.register(...registerables);

    const handleProductTableFilter = (e) => {
        const searchValue = e.target.value;
        setTableProductSearch(searchValue);
    };

    const handleClientTableFilter = (e) => {
        const searchValue = e.target.value;
        setTableClientSearch(searchValue);
    };

    useEffect(() => {
        const filtered = clientTableData.filter((prod) => prod.client.toLowerCase().includes(tableClientSearch.toLowerCase()));

        if (tableClientSearch.trim() === '') {
            setFilterClientTable(clientTableData);
        } else {
            setFilterClientTable(filtered);
        }
    }, [filterClientTable, clientTableData, tableClientSearch]);

    useEffect(() => {
        const filtered = productTableData.filter((prod) => prod.product.toLowerCase().includes(tableProductSearch.toLowerCase()));

        if (tableProductSearch.trim() === '') {
            setFilterProductTable(productTableData);
        } else {
            setFilterProductTable(filtered);
        }
    }, [filterProductTable, productTableData, tableProductSearch]);

    const getQuery = useCallback(async (ref) => {
        const q = query(ref, where('email', '==', user.email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        const newScanArr = [];
        const newRestockArr = [];
        querySnapshot.forEach((document) => {
            const { analytics } = document.data();

            if (analytics.length === 0) {
                setShowInsights(false);
                return;
            }
            setShowInsights(true);

            analytics.forEach((metric) => {
                if (metric.type === 'scan') {
                    newScanArr.push(metric);
                }

                if (metric.type === 'restock') {
                    newRestockArr.push(metric);
                }
            });
        });
        setScanArr(newScanArr);
        setRestockArr(newRestockArr);
        setTimeout(() => {
            setLoading(false);
        }, 750);
    }, [user.email]);

    const findLargestValue = (obj) => {
        let num = Number.NEGATIVE_INFINITY;
        let objectToReturn = {};

        for (const key of Object.keys(obj)) {
            if (obj[key] > num) {
                num = obj[key];
                objectToReturn = key;
            }
        }

        return objectToReturn;
    };

    const makeProductTable = (data) => {
        const newArr = [];
        Object.keys(data).forEach((key) => {
            const newObj = {
                product: key,
                count: data[key],
            };

            newArr.push(newObj);
        });

        const sorted = newArr.sort((a, b) => b.count - a.count);
        setProductTableData(sorted);
    };

    const makeClientTable = (data) => {
        const newArr = [];
        Object.keys(data).forEach((key) => {
            const newObj = {
                client: key,
                count: data[key],
            };

            newArr.push(newObj);
        });

        const sorted = newArr.sort((a, b) => b.count - a.count);
        setClientTableData(sorted);
    };

    useEffect(() => {
        const trackLargestScan = {};
        const trackLargestRestock = {};
        const clientMostRestocked = {};
        if (scanArr.length > 0) {
            scanArr.forEach((scan) => {
                if (!trackLargestScan[scan.product]) {
                    trackLargestScan[scan.product] = 1;
                } else {
                    trackLargestScan[scan.product] += 1;
                }
            });

            const largest = findLargestValue(trackLargestScan);
            console.log('large scan', largest);
            // setLargestScan(largest);
        }

        if (restockArr.length > 0) {
            const labelArr = [];
            const chartVals = {};
            const dateVals = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 0,
                11: 0,
                12: 0,
            };
            restockArr.forEach((restock) => {
                if (!labelArr.includes(restock.product)) {
                    labelArr.push(restock.product);
                }

                if (!trackLargestRestock[restock.product]) {
                    trackLargestRestock[restock.product] = 1;
                } else {
                    trackLargestRestock[restock.product] += 1;
                }

                if (!clientMostRestocked[restock.client]) {
                    clientMostRestocked[restock.client] = 1;
                } else {
                    clientMostRestocked[restock.client] += 1;
                }

                if (!chartVals[restock.product]) {
                    chartVals[restock.product] = 1;
                } else {
                    chartVals[restock.product] += 1;
                }

                const month = Number(restock.date.split('/')[0]);
                // const year = Number(restock.date.split('/')[2]);
                dateVals[month] += 1;
            });

            const dateValArray = [];

            for (const val of Object.values(dateVals)) {
                dateValArray.push(val);
            }

            setChartDateData(dateValArray);

            const largest = findLargestValue(trackLargestRestock);
            const largestClientRestock = findLargestValue(clientMostRestocked);

            setLargestRestock(largest);
            setClientRestock(largestClientRestock);

            makeProductTable(trackLargestRestock);
            makeClientTable(clientMostRestocked);
        }
    }, [scanArr, restockArr]);

    useEffect(() => {
        console.log('checking table data...');
    }, [productTableData]);

    useEffect(() => {
        setLoading(true);
        if (ownerId?.length > 0) {
            const colRef = collection(firestore, 'users');
            getQuery(colRef);
        }
    }, [ownerId, getQuery]);

    if (loading) {
        return <Spin tip="Loading Data..." />;
    }

    if (isUserPremium.planName === '' || isUserPremium.planName === 'bronze') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'column' }}>
                <div style={{ marginBottom: '1rem' }}>Please Upgrade Plan To Unlock Insights.</div>
                <Image src="/empty_analytics.svg" width={400} height={400} style={{ opacity: '.3' }} alt="No analytics" />
            </div>
        );
    }

    const lineChartDate = {
        labels: months,
        datasets: [
            {
                fill: true,
                data: chartDateData,
                borderColor: 'rgb(149, 210, 200)',
                backgroundColor: 'rgb(232, 246, 249)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: { y: { ticks: { stepSize: 1 } } },
        plugins: { legend: { display: false } },
    };

    const productTableColumns = [
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',

        },
        {
            title: 'Restocks',
            dataIndex: 'count',
            key: 'count',

        },
    ];

    const clientTableColumns = [
        {
            title: 'Location',
            dataIndex: 'client',
            key: 'client',

        },
        {
            title: 'Restocks',
            dataIndex: 'count',
            key: 'count',

        },
    ];

    return (
        <Content>
            <Space direction="vertical" size="large" />
            {showInsights ? (
                <div className={styles.insightGridTop}>
                    {scanArr ? <Statistic className={styles.statisticCard} style={{ backgroundImage: 'url(/icons/scan.png)' }} title="Total Number of Scans" value={scanArr.length || 0} /> : ''}
                    {restockArr ? <Statistic className={styles.statisticCard} style={{ backgroundImage: 'url(/icons/inventory.png)' }} title="Total Number of Restocks" value={restockArr.length || 0} /> : ''}
                    {/* {largestScan ? <Statistic className={styles.statisticCard} title="Most Scanned Product" value={largestScan} /> : ''} */}
                    {largestRestock ? <Statistic className={styles.statisticCard} style={{ backgroundImage: 'url(/icons/winner.png)' }} title="Most Restocked Product" value={largestRestock} /> : ''}
                    {clientRestock ? <Statistic className={styles.statisticCard} style={{ backgroundImage: 'url(/icons/building.png)' }} title="Client With Most Restocks" value={clientRestock} /> : ''}

                </div>
            ) : <Empty description="No Insights Available At This Time. Data Will Populate As Codes Are Scanned." />}
            {showInsights ? (
                <div className={styles.scanGraph}>
                    <div className={styles.chart}>
                        <p className={styles.chartTitles}>Restock Requests By Month</p>
                        <Line data={lineChartDate} options={chartOptions} />
                    </div>
                    {productTableData && clientTableData
                        ? (
                            <div className={styles.tableLayout}>
                                <div className={styles.tableData}>
                                    <p className={styles.chartTitles}>Product Restock Performance</p>
                                    <Input placeholder="Search Products..." name="filterProductData" onChange={handleProductTableFilter} type="text" value={tableProductSearch} className={styles.filterInput} />
                                    <Table rowKey={(record) => record.product} bordered size="middle" columns={productTableColumns} dataSource={filterProductTable} />
                                </div>
                                <div className={styles.tableData}>
                                    <p className={styles.chartTitles}>Location Restock Performance</p>
                                    <Input placeholder="Search Locations/Clients..." name="filterLocationData" onChange={handleClientTableFilter} type="text" value={tableClientSearch} className={styles.filterInput} />
                                    <Table rowKey={(record) => record.client} bordered size="middle" columns={clientTableColumns} dataSource={filterClientTable} />
                                </div>
                            </div>
                        ) : '' }
                </div>
            ) : ''}
        </Content>
    );
}
