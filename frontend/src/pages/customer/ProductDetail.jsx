import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api';
import { Flame, ShoppingCart, ArrowLeft, Plus, Minus, Info } from 'lucide-react';
import CrackerBlast from '../../components/customer/CrackerBlast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Qty selector
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (e) {
      console.error(e);
      setError('Product details not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > product.stockQuantity) {
        alert(`Cannot add more. Only ${product.stockQuantity} items in stock.`);
        cart[existingIndex].quantity = product.stockQuantity;
      } else {
        cart[existingIndex].quantity = newQty;
      }
    } else {
      cart.push({ product, quantity, price: product.offerPrice || product.originalPrice });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger custom event to notify Navbar
    window.dispatchEvent(new Event('cart-updated'));
    alert(`${quantity} x ${product.name} added to cart!`);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Info size={48} className="text-gray-300 mx-auto" />
        <p className="text-gray-500 font-bold">{error || 'Failed to load details'}</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline">
          <ArrowLeft size={16} />
          <span>Back to products catalog</span>
        </Link>
      </div>
    );
  }

  const discount = product.offerPrice && product.offerPrice < product.originalPrice
    ? Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100)
    : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      
      {/* Back button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Catalog</span>
      </Link>

      {/* Details Card */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Left: Product Image with Cracker Blast on hover */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-6 min-h-[300px] md:min-h-[400px] relative overflow-hidden group">
          <CrackerBlast />
          {product.imagePath ? (
            <img
              src={getImageUrl(product.imagePath)}
              alt={product.name}
              className="max-h-[350px] object-contain rounded-xl select-none group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Flame className="text-gray-300 group-hover:scale-110 transition-transform duration-300" size={64} />
          )}

          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black py-1 px-3 rounded-lg shadow-sm z-30">
              {discount}% DISCOUNT
            </span>
          )}
        </div>

        {/* Right: Cracker Metadata & Buy Area */}
        <div className="space-y-6 flex flex-col justify-center">
          
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">
              {product.category?.name || 'Crackers'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-outfit text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 font-bold">
              Product Code: <span className="text-gray-600">{product.productCode}</span>
            </p>
          </div>

          {/* Stock Availability */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
              isOutOfStock
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-gray-100 py-4">
            <span className="text-2xl font-black text-red-600">
              ₹{(product.offerPrice || product.originalPrice).toLocaleString('en-IN')}
            </span>
            {product.offerPrice && product.offerPrice < product.originalPrice && (
              <span className="text-sm text-gray-400 line-through font-semibold">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          )}

          {/* Qty Adjustment and Add to Cart Section */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Qty</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={handleDecrement}
                    className="p-2.5 hover:bg-gray-150 text-gray-600 transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 text-sm font-extrabold text-gray-800 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2.5 hover:bg-gray-150 text-gray-600 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Add To Cart</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
