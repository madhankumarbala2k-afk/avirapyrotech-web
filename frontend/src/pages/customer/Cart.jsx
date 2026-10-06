import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { getImageUrl } from '../../api';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(items);
    } catch (e) {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleIncrement = (index) => {
    const updated = [...cart];
    const maxStock = updated[index].product.stockQuantity;
    if (updated[index].quantity < maxStock) {
      updated[index].quantity += 1;
      saveCart(updated);
    } else {
      alert(`Only ${maxStock} items available in stock.`);
    }
  };

  const handleDecrement = (index) => {
    const updated = [...cart];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      saveCart(updated);
    }
  };

  const handleRemove = (index) => {
    if (!window.confirm('Remove this item from cart?')) return;
    saveCart(cart.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (!window.confirm('Clear all items from cart?')) return;
    saveCart([]);
  };

  const getSubtotal = () => cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const getTotalQty  = () => cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Empty state ─────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-800">Cart is Empty</h2>
          <p className="text-sm text-gray-400 font-medium">Explore our crackers and add items to your cart.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-red-500/20"
        >
          <ArrowLeft size={16} />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  /* ── Cart with items ─────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Your Cart</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{getTotalQty()} item(s) ready to order</p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* ── MOBILE-FIRST: Card list for small screens, table hidden ── */}
      <div className="space-y-3 lg:hidden">
        {cart.map((item, index) => (
          <div
            key={item.product.id}
            className="bg-white rounded-2xl border border-gray-150 p-4 flex gap-3 shadow-sm"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
              {item.product.imagePath ? (
                <img src={getImageUrl(item.product.imagePath)} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag size={22} className="text-gray-300" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="font-bold text-sm text-gray-800 truncate">{item.product.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{item.product.productCode}</p>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Qty controls */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => handleDecrement(index)}
                    className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800 select-none">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(index)}
                    className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Price + remove */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-red-600">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Table (hidden on mobile) ── */}
      <div className="hidden lg:block bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Cracker</th>
              <th className="px-6 py-4 text-center">Quantity</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cart.map((item, index) => (
              <tr key={item.product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product.imagePath ? (
                        <img src={getImageUrl(item.product.imagePath)} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-800 line-clamp-1">{item.product.name}</p>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.product.productCode}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 w-24 mx-auto overflow-hidden">
                    <button onClick={() => handleDecrement(index)} className="p-1.5 hover:bg-gray-100 text-gray-500 cursor-pointer"><Minus size={10} /></button>
                    <span className="flex-1 text-center font-bold text-gray-700 select-none">{item.quantity}</span>
                    <button onClick={() => handleIncrement(index)} className="p-1.5 hover:bg-gray-100 text-gray-500 cursor-pointer"><Plus size={10} /></button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-600">₹{item.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-extrabold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleRemove(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Continue shopping */}
      <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors">
        <ArrowLeft size={12} />
        <span>Continue Shopping</span>
      </Link>

      {/* ── Summary + Checkout ── */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-5 space-y-4 max-w-sm sm:max-w-none sm:ml-auto">
        <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3">Order Summary</h3>
        <div className="space-y-2 text-sm font-semibold text-gray-500">
          <div className="flex justify-between">
            <span>Total Items</span>
            <span className="font-extrabold text-gray-800">{getTotalQty()} pcs</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-900">
            <span>Grand Total</span>
            <span className="text-red-600">₹{getSubtotal().toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>Order via WhatsApp — ₹{getSubtotal().toLocaleString('en-IN')}</span>
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl active:scale-[0.98] transition-all text-xs cursor-pointer"
          >
            <span>Standard Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
