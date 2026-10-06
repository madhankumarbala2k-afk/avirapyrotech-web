import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, PhoneCall, Calendar } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || 'N/A';
  const customerName = searchParams.get('name') || 'Valued Customer';
  const totalAmount = searchParams.get('total') || '0';

  const isWhatsApp = searchParams.get('whatsapp') === 'true';

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
      
      {/* Success Animation Card */}
      <div className="bg-white rounded-3xl border border-gray-150 p-8 shadow-sm space-y-6">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={36} className="animate-bounce" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black font-outfit text-gray-900 tracking-tight">
            {isWhatsApp ? 'WhatsApp Order Sent!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            {isWhatsApp 
              ? 'Your formatted order message has been dispatched to Avira Pyrotech on WhatsApp (+91 8610315901).' 
              : 'Thank you for shopping with Avira Pyrotech. Your order has been registered in our system.'}
          </p>
        </div>

        {/* Order Details Receipt */}
        <div className="bg-gray-50 rounded-2xl border border-gray-150 p-5 text-left text-xs font-semibold text-gray-500 space-y-3.5">
          {orderId !== 'WA' && (
            <div className="flex justify-between">
              <span>Order Reference ID</span>
              <span className="text-red-600 font-extrabold font-outfit text-sm">#{orderId}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-3">
            <span>Billing Client</span>
            <span className="text-gray-800 font-extrabold">{decodeURIComponent(customerName)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3">
            <span>Total Payable Amount</span>
            <span className="text-gray-900 font-extrabold text-sm">₹{parseFloat(totalAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Call to Action details */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-left text-emerald-900 text-xs font-medium space-y-1">
          <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
            <PhoneCall size={14} className="text-emerald-600" />
            <span>Next steps</span>
          </p>
          <p className="leading-relaxed text-emerald-800 font-semibold">
            {isWhatsApp
              ? 'If WhatsApp did not open automatically, please click the WhatsApp chat button at the bottom right to connect with us directly (+91 8610315901).'
              : 'Our packaging and delivery team will contact you shortly via phone to confirm your address details and schedule transport.'}
          </p>
        </div>

        {/* Button link */}
        <div className="pt-2">
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
