import { useState, useEffect } from 'react';
import './SalesReport.css';

export default function SalesReports() {
  const [report, setReport] = useState({
    weeklyReport: {},
    monthlyReport: {},
    annualReport: {}
  });
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);

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

        const allYears = new Set();
        Object.keys(data.weeklyReport).forEach((date) => {
          const year = new Date(date).getFullYear();
          if (!isNaN(year)) allYears.add(year);
        });
        Object.keys(data.monthlyReport).forEach((date) => {
          const year = new Date(date).getFullYear();
          if (!isNaN(year)) allYears.add(year);
        });
        Object.values(data.annualReport).forEach((annual) => {
          const year = parseInt(annual.year, 10);
          if (!isNaN(year)) allYears.add(year);
        });

        const sortedYears = [...allYears].sort((a, b) => a - b);
        console.log("Years:", sortedYears);
        setYears(sortedYears);
      } catch (error) {
        console.error('Error fetching sales report:', error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchSalesReport();
    fetchOrders();
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
      weeks.push({
        label: `Week ${weekCounter}`,
        value: `w${weekCounter}-${year}-${month.toString().padStart(2, '0')}`,
        start: new Date(date),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6)
      });
      date.setDate(date.getDate() + 7);
      weekCounter++;
    }

    return weeks;
  };

  const renderProductTable = (products) => {
    return (
      <table className="product-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Total Quantity Sold</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(products).map(([productId, product]) => (
            <tr key={productId}>
              <td>{productId}</td>
              <td>{product.productName}</td>
              <td>{product.totalQtySold}</td>
              <td>{product.totalRevenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const formatDateRange = (start, end) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const startFormatted = start.toLocaleDateString(undefined, options);
    const endFormatted = end.toLocaleDateString(undefined, options);
    return `${startFormatted} - ${endFormatted}`;
  };

  const filterOrdersByPeriod = (orders, period, selectedWeek, selectedMonth, selectedYear) => {
    if (!selectedYear || !selectedWeek) return [];
  
    const selectedWeekObj = getWeeksInMonth(selectedYear, selectedMonth).find(week => week.value === selectedWeek);
    if (!selectedWeekObj) return [];
  
    const startDate = new Date(selectedWeekObj.start.getTime());
    const endDate = new Date(selectedWeekObj.end.getTime());

    return orders.filter(order => {
      const orderDate = new Date(order.dateOrdered);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };
  
  const renderReport = (report, period, selectedWeek, selectedMonth, selectedYear) => {
    let selectedPeriod = '';
    let title = '';
  
    if (period === 'weekly') {
      const selectedWeekObj = selectedWeek && getWeeksInMonth(selectedYear, selectedMonth).find(week => week.value === selectedWeek);
      selectedPeriod = selectedWeek;
      if (selectedWeekObj) {
        const startSunday = new Date(selectedWeekObj.start.getTime());
        startSunday.setDate(startSunday.getDate() - startSunday.getDay());
        const endSaturday = new Date(startSunday.getTime());
        endSaturday.setDate(startSunday.getDate() + 6);
        title = `Sales Report for ${formatDateRange(startSunday, endSaturday)}`;
      }
    } else if (period === 'monthly') {
      selectedPeriod = `${selectedYear}-${selectedMonth}`;
      if (selectedYear && selectedMonth) {
        const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
        title = `Sales Report for ${monthName} ${selectedYear}`;
      }
    } else if (period === 'annual') {
      selectedPeriod = selectedYear;
      if (selectedYear) {
        title = `Sales Report for ${selectedYear}`;
      }
    }
  
    const reportData = report[`${period}Report`] || {};
    const summary = reportData[selectedPeriod];
  
    if (!selectedPeriod || !summary) {
      return <p style={{ textAlign: 'center' }}>No sales report available</p>;
    }
  
    const filteredOrders = filterOrdersByPeriod(orders, period, selectedWeek, selectedMonth, selectedYear);
    console.log("FilteredOrders:", filteredOrders); 
  
    return (
      <div>
        <h3>{title}</h3>
        <h4>Total Sales: $ {summary.totalSales}</h4>
        <h4>Products Sold:</h4>
        {renderProductTable(summary.products)}
      </div>
    );
  };

  return (
    <div className='sales-report-container'>
      <h1 className="sales-report-title">Sales Report</h1>
      <div className="filters-container">
        <label htmlFor="period">Select Period </label>
        <select id="period" value={period} onChange={handlePeriodChange} className="select-period">
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
      {period === 'weekly' && (
        <div>
          <label htmlFor="month">Select Month: </label>
          <select id="month" value={selectedMonth} onChange={handleDateChange} className="select-period">
            <option value="">--Select Month--</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <label htmlFor="year">Select Year: </label>
          <select id="year" value={selectedYear} onChange={handleDateChange} className="select-period">
            <option value="">--Select Year--</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>{String(year)}</option>
            ))}
          </select>
          {selectedMonth && selectedYear && (
            <div>
              <label htmlFor="week">Select Week: </label>
              <select id="week" value={selectedWeek} onChange={handleDateChange} className="select-period">
                <option value="">--Select Week--</option>
                {getWeeksInMonth(selectedYear, selectedMonth).map((week) => (
                  <option key={week.value} value={week.value}>{week.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      {period === 'monthly' && (
        <div>
          <label htmlFor="month">Select Month: </label>
          <select id="month" value={selectedMonth} onChange={handleDateChange} className="select-period">
            <option value="">--Select Month--</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <label htmlFor="year">Select Year: </label>
          <select id="year" value={selectedYear} onChange={handleDateChange} className="select-period">
            <option value="">--Select Year--</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>{String(year)}</option>
            ))}
          </select>
        </div>
      )}
      {period === 'annual' && (
        <div>
          <label htmlFor="year">Select Year: </label>
          <select id="year" value={selectedYear} onChange={handleDateChange} className="select-period">
            <option value="">--Select Year--</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>{String(year)}</option>
            ))}
          </select>
        </div>
      )}
      {renderReport(report, period, selectedWeek, selectedMonth, selectedYear)}
    </div>
  );
}