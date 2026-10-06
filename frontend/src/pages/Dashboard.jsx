import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Boxes,
  ShoppingBag,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Phone,
  FileText,
  BellRing
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    outOfStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  
  const lastOrderIdRef = useRef(null);

  // Poll for stats & recent orders
  const fetchDashboardData = async (isSilence = false) => {
    try {
      if (!isSilence) setLoading(true);
      
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/orders/recent')
      ]);

      setStats(statsRes.data);
      const orders = ordersRes.data;
      
      // If we already have orders, check if a new one was added
      if (orders.length > 0) {
        const latestOrder = orders[0];
        
        if (lastOrderIdRef.current !== null && latestOrder.id > lastOrderIdRef.current) {
          // Play a soft notification beep or show alert
          setToastMessage(`New Order Received! ID: #${latestOrder.id} - ${latestOrder.customerName}`);
          
          // Hide toast after 6 seconds
          setTimeout(() => setToastMessage(null), 6000);
        }
        
        // Save the latest order ID
        lastOrderIdRef.current = latestOrder.id;
      }
      
      setRecentOrders(orders);
    } catch (err) {
      console.error("Error fetching dashboard statistics: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Background polling every 10 seconds for real-time customer orders
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      'New': 'bg-blue-50 text-blue-700 border-blue-200',
      'Confirmed': 'bg-purple-50 text-purple-700 border-purple-200',
      'Processing': 'bg-orange-50 text-orange-700 border-orange-200',
      'Delivered': 'bg-green-50 text-green-700 border-green-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    };
    return `px-2.5 py-1 text-xs font-bold border rounded-full ${config[status] || 'bg-gray-50 text-gray-700'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real-time floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-500 animate-bounce max-w-sm">
          <BellRing className="shrink-0 text-orange-300 animate-pulse" />
          <div>
            <p className="font-bold text-sm">Real-time Alert</p>
            <p className="text-xs font-semibold text-red-100">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm font-semibold mt-1">
          Monitor your shop performance, product stocks, and client orders in real time.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
            <Boxes size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Products</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.totalProducts}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.todayOrders}</h3>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.pendingOrders}</h3>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.completedOrders}</h3>
          </div>
        </div>

        {/* Out of Stock */}
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all ${
          stats.outOfStockProducts > 0 
            ? 'bg-red-50/50 border-red-200 text-red-900' 
            : 'bg-white border-gray-150'
        }`}>
          <div className={`p-3 rounded-xl ${
            stats.outOfStockProducts > 0 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-50 text-gray-650'
          }`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{stats.outOfStockProducts}</h3>
          </div>
        </div>
      </div>

      {/* Out of stock warning banner */}
      {stats.outOfStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-800">
          <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold font-outfit text-sm">Out of Stock Warning</h4>
            <p className="text-xs mt-1 font-semibold text-amber-700">
              There are currently {stats.outOfStockProducts} products that are out of stock. Customers will not be able to purchase these products. 
              Go to <Link to="/products" className="underline hover:text-amber-900">Products Management</Link> to update stock counts.
            </p>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 font-outfit">Recent Customer Orders</h2>
            <p className="text-gray-400 text-xs mt-0.5 font-semibold">Latest orders placed on the website</p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400 font-semibold text-sm">No orders placed yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Customer Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Placed At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total Items</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const itemsCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        #{order.id}
                      </td>
                      {/* Customer Name & Phone */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                          <a 
                            href={`tel:${order.mobileNumber}`} 
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 font-semibold mt-0.5"
                          >
                            <Phone size={12} />
                            <span>{order.mobileNumber}</span>
                          </a>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      {/* Items Count */}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      {/* Total Price */}
                      <td className="px-6 py-4 text-sm font-extrabold text-gray-900">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders?id=${order.id}`}
                          className="inline-flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-all"
                          title="Manage Order"
                        >
                          <FileText size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
