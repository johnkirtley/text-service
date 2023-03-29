/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
import { useState, useEffect, useCallback, useContext } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import {
    Layout, Space, Spin, Empty, Statistic,
} from 'antd';
import { Chart, registerables } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { firestore } from '../../firebase/clientApp';
import { useAuth } from '../../Context/AuthContext';

import OwnerIdContext from '../../Context/OwnerIdContext';
import usePremiumStatus from '../../stripe/usePremiumStatus';

import styles from './HomeComponent.module.css';

const defaultMonths = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec'];

export default function Home() {
    const [scanArr, setScanArr] = useState([]);
    const [restockArr, setRestockArr] = useState([]);
    const [largestRestock, setLargestRestock] = useState('');
    const [largestScan, setLargestScan] = useState('');
    const [clientRestock, setClientRestock] = useState(null);
    const [chartLabels, setChartLabels] = useState([]);
    const [months] = useState(defaultMonths);
    const [chartValues, setChartValues] = useState([]);
    const [chartDateData, setChartDateData] = useState([]);
    const { ownerId } = useContext(OwnerIdContext);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const isUserPremium = usePremiumStatus(user);

    const { Content } = Layout;

    Chart.register(...registerables);

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

    useEffect(() => {
        const trackLargestScan = {};
        const trackLargestRestock = {};
        const clientMostRestocked = {};
        console.log('scan arr', scanArr);
        console.log('restock arr', restockArr);
        if (scanArr.length > 0) {
            scanArr.forEach((scan) => {
                if (!trackLargestScan[scan.product]) {
                    trackLargestScan[scan.product] = 1;
                } else {
                    trackLargestScan[scan.product] += 1;
                }
            });
            console.log('obj scan', trackLargestScan);

            const largest = findLargestValue(trackLargestScan);
            console.log('large scan', largest);
            setLargestScan(largest);
        }

        if (restockArr.length > 0) {
            const labelArr = [];
            const chartVals = {};
            const dateVals = {
                1: 1,
                2: 4,
                3: 0,
                4: 2,
                5: 9,
                6: 4,
                7: 12,
                8: 3,
                9: 15,
                10: 0,
                11: 2,
                12: 1,
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

            const chartValArray = [];

            for (const val of Object.values(chartVals)) {
                chartValArray.push(val);
            }

            const dateValArray = [];

            for (const val of Object.values(dateVals)) {
                dateValArray.push(val);
            }

            setChartDateData(dateValArray);
            setChartLabels(labelArr);
            setChartValues(chartValArray);

            const largest = findLargestValue(trackLargestRestock);
            const largestClientRestock = findLargestValue(clientMostRestocked);

            setLargestRestock(largest);
            setClientRestock(largestClientRestock);
        }
    }, [scanArr, restockArr]);

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

    if (isUserPremium.planName === '' || isUserPremium.planName === 'silver') {
        return <div>Please Upgrade Plan To Unlock Insights.</div>;
    }

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartValues,
                backgroundColor: [
                    'rgba(241, 189, 93, 0.7)', // Color for January
                    // More colors...
                ],
                borderColor: [
                    'rgba(241, 189, 93, 0.7)', // Color for January
                    // More colors...
                ],
                borderWidth: 1,
            },
        ],
    };

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

    return (
        <Content>
            <Space direction="vertical" size="large" />
            <div className={styles.insightHeader}>Overview</div>
            {showInsights ? (
                <div className={styles.insightGridTop}>
                    {scanArr ? <Statistic className={styles.statisticCard} title="Total Number of Scans" value={scanArr.length || 0} /> : ''}
                    {restockArr ? <Statistic className={styles.statisticCard} title="Total Number of Restocks" value={restockArr.length || 0} /> : ''}
                    {largestScan ? <Statistic className={styles.statisticCard} title="Most Scanned Product" value={largestScan} /> : ''}
                    {largestRestock ? <Statistic className={styles.statisticCard} title="Most Restocked Product" value={largestRestock} /> : ''}
                    {clientRestock ? <Statistic className={styles.statisticCard} title="Client With Most Restocks" value={clientRestock} /> : ''}

                </div>
            ) : <Empty description="No Insights Available At This Time. Data Will Populate As Codes Are Scanned." />}
            {showInsights ? (
                <div className={styles.scanGraph}>
                    <div className={styles.chart}>
                        <div>Restock Requests By Month</div>
                        <Line data={lineChartDate} options={chartOptions} />
                    </div>
                    <div className={styles.chart}>
                        <div>Restock Requests By Product</div>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            ) : ''}
        </Content>
    );
}
