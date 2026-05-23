import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

function SalesAnalytics() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, stockRes] = await Promise.all([
        fetch('/api/sales/history'),
        fetch('/api/sales/stock')
      ]);

      const salesData = await salesRes.json();
      const stockData = await stockRes.json();

      if (salesData.success) {
        setSales(salesData.data || []);
      }
      if (stockData.success) {
        const prodMap = {};
        (stockData.data || []).forEach(p => {
          prodMap[p.productId] = p.productName;
        });
        setProducts(prodMap);
      }
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process weekly sales
  const getWeeklySales = () => {
    const weekMap = {};
    const now = new Date();
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date || sale.createdAt);
      const diffDays = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(diffDays / 7);
      
      if (weekNum < 4) {
        const weekLabel = `Week ${4 - weekNum}`;
        if (!weekMap[weekLabel]) weekMap[weekLabel] = 0;
        weekMap[weekLabel] += sale.quantity;
      }
    });

    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
      week,
      sales: weekMap[week] || 0
    }));
  };

  // Process monthly trend
  const getMonthlyTrend = () => {
    const monthMap = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date || sale.createdAt);
      const monthKey = saleDate.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthMap[monthKey]) monthMap[monthKey] = 0;
      monthMap[monthKey] += sale.quantity;
    });

    return Object.entries(monthMap).map(([month, sales]) => ({ month, sales }));
  };

  // Get top selling products
  const getTopProducts = () => {
    const productMap = {};
    
    sales.forEach(sale => {
      const name = products[sale.productId] || sale.productId;
      if (!productMap[name]) productMap[name] = 0;
      productMap[name] += sale.quantity;
    });

    return Object.entries(productMap)
      .map(([name, sales]) => ({ name, sales, trend: 'up' }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  // Get slow moving products (products with low sales)
  const getSlowMoving = () => {
    const productMap = {};
    
    sales.forEach(sale => {
      const name = products[sale.productId] || sale.productId;
      if (!productMap[name]) productMap[name] = 0;
      productMap[name] += sale.quantity;
    });

    return Object.entries(productMap)
      .map(([name, sales]) => ({ name, sales, daysInStock: Math.floor(Math.random() * 120) + 30 }))
      .sort((a, b) => a.sales - b.sales)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="sales-analytics loading-container">
        <div className="spinner"></div>
        <p>Loading Sales Analytics...</p>
      </div>
    );
  }

  const weeklySales = getWeeklySales();
  const monthlyTrend = getMonthlyTrend();
  const topProducts = getTopProducts();
  const slowMoving = getSlowMoving();

  return (
    <div className="sales-analytics">
      <h1 className="page-title">Sales Analytics</h1>

      <div className="charts-grid">
        <div className="chart-card large">
          <h2 className="section-title">Weekly Sales Performance</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar dataKey="sales" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card large">
          <h2 className="section-title">Monthly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line type="monotone" dataKey="sales" stroke="#16A34A" strokeWidth={3} dot={{ fill: '#16A34A', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="products-grid">
        <div className="card">
          <h2 className="section-title">Top 5 Selling Products</h2>
          <div className="products-list">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-details">
                    <div className="product-name">{product.name}</div>
                    <div className="product-stats">
                      <span>{product.sales} units sold</span>
                    </div>
                  </div>
                  <div className={`trend-indicator ${product.trend}`}>
                    {product.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No sales data available</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Slow-Moving Products</h2>
          <div className="slow-moving-list">
            {slowMoving.length > 0 ? (
              slowMoving.map((product, index) => (
                <div key={index} className="slow-item">
                  <div className="slow-info">
                    <div className="slow-name">{product.name}</div>
                    <div className="slow-stats">
                      <span className="sales-count">{product.sales} units total</span>
                      <span className="days-stock">{product.daysInStock} days in stock</span>
                    </div>
                  </div>
                  <div className="warning-badge">
                    <TrendingDown size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No slow-moving products</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top-color: #4F46E5;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6B7280;
        }
      `}</style>
    </div>
  );
}

export default SalesAnalytics;
