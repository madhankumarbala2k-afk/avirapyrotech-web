import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { ShoppingBag, ArrowLeft, CreditCard, CheckCircle2, MessageSquare, Send } from 'lucide-react';

/* ── Reusable input field wrapper (defined outside Checkout to preserve input focus across keystrokes) ── */
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition-colors disabled:opacity-60";

export default function Checkout() {
  const [cart, setCart]   = useState([]);
  const navigate          = useNavigate();

  const [form, setForm] = useState({
    customerName:  '',
    mobileNumber:  '',
    address:       '',
    landmark:      '',
    district:      '',
    pincode:       '',
    customerNotes: '',
  });

  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(items);
      if (items.length === 0) navigate('/cart');
    } catch {
      navigate('/cart');
    }
  }, [navigate]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const getSubtotal = () => cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const validateForm = () => {
    const { customerName, mobileNumber, address, district, pincode } = form;
    if (!customerName.trim() || !mobileNumber.trim() || !address.trim() || !district.trim()) {
      setError('Please fill all required fields (*)');
      return false;
    }
    if (mobileNumber.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  // Helper to build WhatsApp Message Link
  const buildWhatsAppUrl = () => {
    const targetNumber = "918610315901";
    const fullAddress = `${form.address.trim()}${form.landmark.trim() ? ', Near ' + form.landmark.trim() : ''}, ${form.district.trim()}${form.pincode.trim() ? ' - ' + form.pincode.trim() : ''}`;

    let msg = `*NEW ORDER - AVIRA PYROTECH*\n`;
    msg += `--------------------------------\n`;
    msg += `*Customer Details:*\n`;
    msg += `Name: ${form.customerName.trim()}\n`;
    msg += `Phone: ${form.mobileNumber.trim()}\n`;
    msg += `Delivery Address: ${fullAddress}\n`;
    msg += `--------------------------------\n`;
    msg += `*Order Items:*\n`;

    cart.forEach((item, idx) => {
      const itemTotal = (item.price * item.quantity).toLocaleString('en-IN');
      msg += `${idx + 1}. ${item.product.name} x ${item.quantity} = ₹${itemTotal}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*Total Amount: ₹${getSubtotal().toLocaleString('en-IN')}*\n`;
    msg += `--------------------------------\n`;
    msg += `Please confirm stock availability and share GPay details for payment. Thank you!`;

    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Submit via WhatsApp
  const handleWhatsAppCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    const whatsappUrl = buildWhatsAppUrl();

    try {
      const payload = {
        customerName:  form.customerName.trim(),
        mobileNumber:  form.mobileNumber.trim(),
        address:       `${form.address.trim()}, ${form.district.trim()}`,
        landmark:      form.landmark.trim() || null,
        district:      form.district.trim(),
        pincode:       form.pincode.trim() || null,
        customerNotes: form.customerNotes.trim() ? `[WhatsApp Order] ${form.customerNotes.trim()}` : '[WhatsApp Order]',
        totalAmount:   getSubtotal(),
        orderItems: cart.map((i) => ({
          product:  { id: i.product.id },
          quantity: i.quantity,
          price:    i.price,
        })),
      };

      // Save order to DB as well
      let orderId = 'WA';
      try {
        const response = await api.post('/orders', payload);
        orderId = response.data.id;
      } catch (err) {
        console.warn('Backend order save deferred, launching WhatsApp directly:', err);
      }

      // Open WhatsApp chat in new window
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Clear local cart state
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));

      // Redirect to Order Success page
      navigate(`/order-success?id=${orderId}&name=${encodeURIComponent(form.customerName)}&total=${getSubtotal()}&whatsapp=true`);
    } catch (err) {
      console.error(err);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      navigate(`/order-success?name=${encodeURIComponent(form.customerName)}&total=${getSubtotal()}&whatsapp=true`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Standard Web Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        customerName:  form.customerName.trim(),
        mobileNumber:  form.mobileNumber.trim(),
        address:       form.address.trim(),
        landmark:      form.landmark.trim() || null,
        district:      form.district.trim(),
        pincode:       form.pincode.trim() || null,
        customerNotes: form.customerNotes.trim() || null,
        totalAmount:   getSubtotal(),
        orderItems: cart.map((i) => ({
          product:  { id: i.product.id },
          quantity: i.quantity,
          price:    i.price,
        })),
      };
      const response = await api.post('/orders', payload);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      navigate(`/order-success?id=${response.data.id}&name=${encodeURIComponent(form.customerName)}&total=${getSubtotal()}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Back link + heading */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors mb-3">
          <ArrowLeft size={14} />
          Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Checkout</h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5">Fill your delivery details to complete your order via WhatsApp or Online Direct.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 text-red-700 p-4 border border-red-200 rounded-2xl text-sm font-semibold">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── MOBILE-FIRST: stacked layout (form first, summary below) ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Delivery Form ── */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-150 p-5 sm:p-7 shadow-sm">
          <form className="space-y-5">
            <h2 className="font-extrabold text-sm text-gray-700 border-b border-gray-100 pb-3">
              Delivery Information
            </h2>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  placeholder="e.g. Madhan Kumar"
                  value={form.customerName}
                  onChange={setField('customerName')}
                  disabled={submitting}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Mobile Number" required>
                <input
                  type="tel"
                  placeholder="e.g. 8610315901"
                  value={form.mobileNumber}
                  onChange={setField('mobileNumber')}
                  disabled={submitting}
                  required
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Address */}
            <Field label="Delivery City / Address" required>
              <textarea
                rows={3}
                placeholder="Door No, Street name, Area, City…"
                value={form.address}
                onChange={setField('address')}
                disabled={submitting}
                required
                className={`${inputCls} leading-relaxed resize-none`}
              />
            </Field>

            {/* Landmark */}
            <Field label="Landmark (Optional)">
              <input
                type="text"
                placeholder="e.g. Near Bus Stand / Temple"
                value={form.landmark}
                onChange={setField('landmark')}
                disabled={submitting}
                className={inputCls}
              />
            </Field>

            {/* District + Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="District / Town" required>
                <input
                  type="text"
                  placeholder="e.g. Virudhunagar / Sivakasi"
                  value={form.district}
                  onChange={setField('district')}
                  disabled={submitting}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Pincode (Optional)">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 626123"
                  value={form.pincode}
                  onChange={setField('pincode')}
                  disabled={submitting}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Notes */}
            <Field label="Special Instructions (Optional)">
              <textarea
                rows={2}
                placeholder="Delivery timing, packaging notes…"
                value={form.customerNotes}
                onChange={setField('customerNotes')}
                disabled={submitting}
                className={`${inputCls} leading-relaxed resize-none`}
              />
            </Field>

            {/* Payment note */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex gap-3">
              <MessageSquare size={20} className="shrink-0 text-emerald-600 mt-0.5" />
              <div className="text-xs font-medium space-y-0.5">
                <p className="font-extrabold text-emerald-900">Direct WhatsApp Order Confirmation</p>
                <p className="text-emerald-700 leading-relaxed">
                  Clicking <b>Order via WhatsApp</b> generates a formatted order summary directly in WhatsApp to owner line (+91 8610315901). You can instantly confirm stock & pay via GPay/PhonePe!
                </p>
              </div>
            </div>

            {/* Action Buttons: Primary WhatsApp + Secondary Website Order */}
            <div className="space-y-3 pt-2">
              {/* PRIMARY WHATSAPP BUTTON */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing WhatsApp Order…</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    <span>Order via WhatsApp — ₹{getSubtotal().toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              {/* SECONDARY STANDARD WEBSITE BUTTON */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl active:scale-[0.98] transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>Place Order Directly on Website</span>
              </button>
            </div>

          </form>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:w-72 bg-white rounded-3xl border border-gray-150 shadow-sm p-5 h-fit space-y-4 lg:sticky lg:top-20">
          <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShoppingBag size={14} className="text-red-600" />
            Order Summary
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-2 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-gray-400 font-medium">Qty {item.quantity} × ₹{item.price}</p>
                </div>
                <span className="font-extrabold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-black text-gray-900">
            <span>Total</span>
            <span className="text-emerald-600">₹{getSubtotal().toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

