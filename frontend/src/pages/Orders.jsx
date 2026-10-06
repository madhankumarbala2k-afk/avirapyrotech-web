import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  Search,
  Phone,
  MessageSquare,
  Printer,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // URL search query parsing (allows navigation directly to a specific order, e.g. from Dashboard click)
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('id');

  // Detail Modal / Active Invoice State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: filterStatus || null,
        page,
        size: pageSize
      };
      const response = await api.get('/orders', { params });
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);

      // If we have a highlighted order ID, find it and open details
      if (highlightOrderId) {
        const orderId = parseInt(highlightOrderId);
        const highlighted = response.data.content.find(o => o.id === orderId);
        if (highlighted) {
          setSelectedOrder(highlighted);
          setModalOpen(true);
        } else {
          // If not in current page, fetch it directly
          try {
            const singleRes = await api.get(`/orders/${orderId}`);
            if (singleRes.data) {
              setSelectedOrder(singleRes.data);
              setModalOpen(true);
            }
          } catch (e) {
            console.error("Highlighted order not found", e);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  // Update order status
  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, null, {
        params: { status }
      });
      // Refresh list and if active is selected, update active order
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(response.data);
      }
    } catch (err) {
      alert(err.response?.data || "Failed to update order status");
    }
  };

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      setModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert("Failed to delete order");
    }
  };

  // Open details
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
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

  // WhatsApp Pre-filled message generator
  const getWhatsAppLink = (order) => {
    const cleanNumber = order.mobileNumber.replace(/[^\d]/g, '');
    const itemsText = order.orderItems
      .map(item => `• ${item.product.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`)
      .join('\n');
      
    const message = `Hello ${order.customerName},\n\nThis is an update regarding your order *#${order.id}* from *AVIRA PYROTECH*.\n\n*Status:* ${order.status}\n\n*Order Items:*\n${itemsText}\n\n*Total Amount:* ₹${order.totalAmount}\n\nThank you for shopping with us! Let us know if you have any questions.`;
    
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  // Trigger print invoice helper
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
          Order Management
        </h1>
        <p className="text-gray-500 text-sm font-semibold mt-1">
          Review customer billing details, update process status, print invoices, and update customers.
        </p>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center gap-4 no-print">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Order ID, customer name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search size={18} />
          </span>
        </form>

        {/* Filter by status */}
        <div className="shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none text-sm font-semibold cursor-pointer"
          >
            <option value="">All Orders</option>
            <option value="New">New</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400 font-bold text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden flex flex-col justify-between no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Customer Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Placed Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total Price</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Order ID */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      #{order.id}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                        <span className="text-xs text-gray-400 font-semibold">{order.mobileNumber}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 text-sm font-extrabold text-gray-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>

                    {/* Status Select */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold py-1 px-2 border rounded-xl bg-white cursor-pointer focus:outline-none ${
                          order.status === 'Cancelled' ? 'text-red-650 border-red-200' :
                          order.status === 'Delivered' ? 'text-green-700 border-green-200' : 'text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-all cursor-pointer"
                          title="View Details / Print Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal overlay */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between no-print">
              <span className="text-sm font-bold text-gray-400">Order ID: #{selectedOrder.id} Details</span>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-450 hover:text-gray-800 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Top Quick Actions toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-150 no-print">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status:</span>
                  <span className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</span>
                  
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="text-xs font-bold border border-gray-200 rounded-lg p-1 bg-white cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Click to Call */}
                  <a
                    href={`tel:${selectedOrder.mobileNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Phone size={14} className="text-green-500" />
                    <span>Call Customer</span>
                  </a>
                  
                  {/* Click to WhatsApp */}
                  <a
                    href={getWhatsAppLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-all shadow-sm"
                  >
                    <MessageSquare size={14} className="text-green-500" />
                    <span>WhatsApp Chat</span>
                  </a>

                  {/* Print Invoice */}
                  <button
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

              {/* Printable Invoice Container */}
              <div id="invoice-print-area" className="bg-white p-6 border border-gray-200 rounded-3xl space-y-6">
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-150 pb-6">
                  <div>
                    <h2 className="text-2xl font-black font-outfit text-gray-900 tracking-wider">
                      AVIRA <span className="text-red-600">PYROTECH</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Quality Sivakasi Fireworks & Crackers</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Sivakasi, Tamil Nadu, India</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-gray-800 font-outfit uppercase">Invoice</h3>
                    <p className="text-xs font-bold text-red-600 mt-1">ID: #{selectedOrder.id}</p>
                    <div className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1 justify-end">
                      <Calendar size={12} />
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Billing details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-150 pb-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Details</h4>
                    <p className="text-sm font-extrabold text-gray-800">{selectedOrder.customerName}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">Phone: {selectedOrder.mobileNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</h4>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed flex items-start gap-1">
                      <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                      <span>
                        {selectedOrder.address}<br />
                        {selectedOrder.landmark && <span>Landmark: {selectedOrder.landmark}<br /></span>}
                        {selectedOrder.district && <span>District: {selectedOrder.district} </span>}
                        {selectedOrder.pincode && <span>- {selectedOrder.pincode}</span>}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Details</h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2">Code</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems.map((item) => (
                        <tr key={item.id} className="text-gray-700 font-medium">
                          <td className="px-4 py-2.5 font-bold">{item.product.name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{item.product.productCode}</td>
                          <td className="px-4 py-2.5 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-extrabold text-gray-900 text-sm">
                        <td colSpan="3" className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center">Grand Total:</td>
                        <td className="px-4 py-3 text-right text-red-600 text-md">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Customer Notes */}
                {selectedOrder.customerNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-xs">
                    <h5 className="font-bold uppercase tracking-wider mb-1">Customer Notes</h5>
                    <p className="font-medium text-yellow-750">{selectedOrder.customerNotes}</p>
                  </div>
                )}

                {/* Invoice Footer (For print layout) */}
                <div className="hidden print:block text-center border-t border-dashed border-gray-300 pt-6 text-[10px] text-gray-400">
                  <p>Thank you for buying from Avira Pyrotech!</p>
                  <p className="mt-1">For changes or delivery questions, call {selectedOrder.mobileNumber}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
