import React, { useState, useEffect } from 'react';

export default function SalesReports() {
  const [report, setReport] = useState({
    weeklyReport: {},
    monthlyReport: {},
    annualReport: {}
  });
  const [period, setPeriod] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/sales-report`);
        if (!response.ok) throw new Error('Failed to fetch sales report');
        const data = await response.json();
        console.log("Fetched Data:", data);
        setReport({
          weeklyReport: data.weeklyReport,
          monthlyReport: data.monthlyReport,
          annualReport: data.annualReport
        });
      } catch (error) {
        console.error('Error fetching sales report:', error);
      }
    };

    fetchSalesReport();
  }, []);

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    setSelectedWeek('');
    setSelectedMonth('');
    setSelectedYear('');
  };

  const handleDateChange = (event) => {
    const { id, value } = event.target;
    if (id === 'week') {
      setSelectedWeek(value);
    } else if (id === 'month') {
      setSelectedMonth(value);
    } else if (id === 'year') {
      setSelectedYear(value);
    }
  };

  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    const date = new Date(year, month - 1, 1);
    let weekCounter = 1;

    while (date.getMonth() === month - 1) {
      weeks.push(`w${weekCounter}-${year}-${month.toString().padStart(2, '0')}`);
      date.setDate(date.getDate() + 7);
      weekCounter++;
    }

    return weeks;
  };

  const renderReport = (report, period, selectedWeek, selectedMonth, selectedYear) => {
    let selectedPeriod = '';
    if (period === 'weekly') {
      selectedPeriod = selectedWeek;
    } else if (period === 'monthly') {
      selectedPeriod = `${selectedYear}-${selectedMonth}`;
    } else if (period === 'annual') {
      selectedPeriod = selectedYear;
    }

    console.log("Selected Period:", selectedPeriod);
    console.log("Report:", report);
    console.log("Report[Period]:", report[`${period}Report`]);

    const reportData = report[`${period}Report`] || {};
    const summary = reportData[selectedPeriod];

    if (!selectedPeriod || !summary) {
      return <p>No sales report available.</p>;
    }

    return (
      <div>
        <h3>{period.charAt(0).toUpperCase() + period.slice(1)} Sales Report for {selectedPeriod}</h3>
        <p>Total Sales: {summary.totalSales}</p>
        <h4>Products:</h4>
        <ul>
          {Object.entries(summary.products).map(([productId, product]) => (
            <li key={productId}>
              <p>Product ID: {productId}</p>
              <p>Product Name: {product.productName}</p>
              <p>Total Quantity Sold: {product.totalQtySold}</p>
              <p>Total Revenue: {product.totalRevenue}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h1>Sales Reports</h1>
      <div>
        <label htmlFor="period">Select Period: </label>
        <select id="period" value={period} onChange={handlePeriodChange}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
      {period === 'weekly' && (
        <div>
          <label htmlFor="month">Select Month: </label>
          <select id="month" value={selectedMonth} onChange={handleDateChange}>
            <option value="">--Select Month--</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <label htmlFor="year">Select Year: </label>
          <input type="number" id="year" value={selectedYear} onChange={handleDateChange} placeholder="YYYY" />
          {selectedMonth && selectedYear && (
            <div>
              <label htmlFor="week">Select Week: </label>
              <select id="week" value={selectedWeek} onChange={handleDateChange}>
                <option value="">--Select Week--</option>
                {getWeeksInMonth(selectedYear, selectedMonth).map((week) => (
                  <option key={week} value={week}>{week}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      {period === 'monthly' && (
        <div>
          <label htmlFor="month">Select Month: </label>
          <select id="month" value={selectedMonth} onChange={handleDateChange}>
            <option value="">--Select Month--</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <label htmlFor="year">Select Year: </label>
          <input type="number" id="year" value={selectedYear} onChange={handleDateChange} placeholder="YYYY" />
        </div>
      )}
      {period === 'annual' && (
        <div>
          <label htmlFor="year">Select Year: </label>
          <input type="number" id="year" value={selectedYear} onChange={handleDateChange} placeholder="YYYY" />
        </div>
      )}
      {renderReport(report, period, selectedWeek, selectedMonth, selectedYear)}
    </div>
  );
}
