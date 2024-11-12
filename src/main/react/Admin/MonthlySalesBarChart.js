import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

function MonthlySalesBarChart({ period }) {
    const storeNo = sessionStorage.getItem('storeNo');
    const chartRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [chartData, setChartData] = useState({
        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}일`), // 기본 값으로 1일부터 31일까지
        datasets: [
            {
                label: '매출액',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
                hoverBorderColor: 'rgba(75, 192, 192, 1)',
                data: Array(31).fill(0) // 각 일의 매출 초기화
            }
        ]
    });

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                if (period === '올해') {
                    const response = await axios.get(`/adminReservation/priceMonth/${storeNo}`);
                    const salesData = response.data;

                    const filteredData = salesData.filter(item => item.year === currentYear);

                    const updatedData = Array(12).fill(0);
                    filteredData.forEach(item => {
                        updatedData[item.month - 1] = item.totalSales;
                    });

                    setChartData(prevData => ({
                        ...prevData,
                        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                        datasets: [
                            {
                                ...prevData.datasets[0],
                                data: updatedData
                            }
                        ]
                    }));
                } else if (period === '이번달') {
                    const response = await axios.get(`/adminReservation/priceDay/${storeNo}`);
                    const salesData = response.data;

                    const updatedData = Array(31).fill(0);
                    salesData.forEach(item => {
                        updatedData[item.day - 1] = item.totalSales;
                    });

                    setChartData(prevData => ({
                        ...prevData,
                        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}일`),
                        datasets: [
                            {
                                ...prevData.datasets[0],
                                data: updatedData
                            }
                        ]
                    }));
                }
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };

        fetchSalesData();
    }, [storeNo, currentYear, period]);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const options = {
        responsive: true,
        animations: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#333'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
                bodyColor: '#fff',
                titleColor: '#fff'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                title: {
                    display: true,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.5)'
                },
                ticks: {
                    stepSize: 1000
                }
            }
        }
    };

    return <Bar ref={chartRef} data={chartData} options={options} />;
}

export default MonthlySalesBarChart;
