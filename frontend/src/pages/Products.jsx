import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export default function Products() {
  // State for products list
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(8);

  // State for Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [status, setStatus] = useState('Available');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImagePath, setExistingImagePath] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  // Error / Form state feedback
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        categoryId: filterCategory || null,
        status: filterStatus || null,
        page,
        size: pageSize,
        sortBy: 'id',
        sortDir: 'desc'
      };

      const response = await api.get('/products', { params });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, filterCategory, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  // Duplicate product
  const handleDuplicate = async (id) => {
    if (!window.confirm("Are you sure you want to duplicate this product?")) return;
    try {
      await api.post(`/products/${id}/duplicate`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data || "Duplication failed");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data || "Deletion failed");
    }
  };

  // Open modal for Create
  const openCreateModal = () => {
    setEditProductId(null);
    setName('');
    setProductCode('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setDescription('');
    setOriginalPrice('');
    setOfferPrice('');
    setStatus('Available');
    setIsFeatured(false);
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
    setFormError('');
    setModalOpen(true);
  };

  // Open modal for Edit
  const openEditModal = (product) => {
    setEditProductId(product.id);
    setName(product.name || '');
    setProductCode(product.productCode || '');
    setCategoryId(product.category?.id || '');
    setDescription(product.description || '');
    setOriginalPrice(product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice : '');
    setOfferPrice(product.offerPrice !== undefined && product.offerPrice !== null ? product.offerPrice : '');
    setStatus(product.status || 'Available');
    setIsFeatured(!!product.isFeatured);
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath(product.imagePath || '');
    setFormError('');
    setModalOpen(true);
  };

  // Handle image drag & drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file) => {
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image exceeds the 5MB file size limit.');
      return;
    }

    // Validate type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      setFormError('Unsupported file format. Use JPG, JPEG, PNG, or WEBP.');
      return;
    }

    setFormError('');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
  };

  // Save Product (Submit Form)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate details
    if (!name.trim() || !productCode.trim() || !categoryId || originalPrice === '' || offerPrice === '') {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    if (parseFloat(offerPrice) > parseFloat(originalPrice)) {
      setFormError('Offer price cannot be higher than original price.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('productCode', productCode);
      formData.append('categoryId', categoryId);
      formData.append('description', description);
      formData.append('originalPrice', originalPrice);
      formData.append('offerPrice', offerPrice);
      formData.append('stockQuantity', status === 'Out of Stock' ? 0 : 999);
      formData.append('status', status);
      formData.append('isFeatured', isFeatured);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (existingImagePath) {
        // Keep the old path if not changed
        formData.append('imagePath', existingImagePath);
      }

      if (editProductId) {
        // Edit mode
        await api.put(`/products/${editProductId}`, formData);
      } else {
        // Create mode
        await api.post('/products', formData);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || 'Failed to save product. Please try again.');
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Featured status directly
  const toggleFeaturedDirectly = async (product) => {
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('productCode', product.productCode);
      formData.append('categoryId', product.category?.id);
      formData.append('description', product.description || '');
      formData.append('originalPrice', product.originalPrice);
      formData.append('offerPrice', product.offerPrice);
      formData.append('stockQuantity', product.stockQuantity ?? (product.status === 'Out of Stock' ? 0 : 999));
      formData.append('status', product.status || 'Available');
      formData.append('isFeatured', !product.isFeatured);
      if (product.imagePath) {
        formData.append('imagePath', product.imagePath);
      }
      
      await api.put(`/products/${product.id}`, formData);
      fetchProducts();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  // Toggle Available / Out of Stock status directly
  const toggleStatusDirectly = async (product) => {
    try {
      const nextStatus = product.status === 'Available' ? 'Out of Stock' : 'Available';
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('productCode', product.productCode);
      formData.append('categoryId', product.category?.id);
      formData.append('description', product.description || '');
      formData.append('originalPrice', product.originalPrice);
      formData.append('offerPrice', product.offerPrice);
      formData.append('stockQuantity', nextStatus === 'Out of Stock' ? 0 : 999);
      formData.append('status', nextStatus);
      formData.append('isFeatured', product.isFeatured);
      if (product.imagePath) {
        formData.append('imagePath', product.imagePath);
      }
      
      await api.put(`/products/${product.id}`, formData);
      fetchProducts();
    } catch (err) {
      alert("Failed to toggle product status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
            Product Management
          </h1>
          <p className="text-gray-500 text-sm font-semibold mt-1">
            Create, duplicate, filter, and adjust stocks for crackers items.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-655 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by product name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search size={18} />
          </span>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none text-sm font-semibold cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none text-sm font-semibold cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table Area */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center">
          <FolderOpen className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400 font-bold text-sm">No products found matching your search</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Product</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Code</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Price (Original / Offer)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Featured</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Image & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-150 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imagePath ? (
                            <img
                              src={getImageUrl(product.imagePath)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-300 text-xs font-bold uppercase">No Image</span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {product.productCode}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {product.category?.name}
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">₹{product.offerPrice}</span>
                        <span className="text-xs text-gray-400 line-through font-semibold">₹{product.originalPrice}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatusDirectly(product)}
                        className={`px-2.5 py-1 text-xs font-bold border rounded-full transition-all cursor-pointer hover:opacity-80 ${
                          product.status === 'Available'
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title="Click to toggle status (Available / Out of Stock)"
                      >
                        {product.status || 'Available'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeaturedDirectly(product)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          product.isFeatured
                            ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-gray-450 border-gray-200 hover:bg-gray-50'
                        }`}
                        title={product.isFeatured ? "Featured" : "Not Featured"}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-all cursor-pointer"
                          title="Duplicate Product"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Product"
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

          {/* Pagination Controls */}
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

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 font-outfit">
                {editProductId ? 'Edit Product Details' : 'Add New Cracker Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-450 hover:text-gray-800 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl text-sm font-semibold">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 1: Basic details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10k Wala Wala"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Product Code (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-GW-10K"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Grid 2: Category and description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-750 rounded-xl focus:outline-none text-sm font-bold cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Loud blast sound and premium quality spark fireworks."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Grid 3: Pricing & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Original Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 599"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Grid 4: Product Image Drag & Drop */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Product Photo
                </label>
                
                {imagePreview || existingImagePath ? (
                  <div className="relative w-48 h-48 border border-gray-250 rounded-2xl overflow-hidden bg-gray-55/30">
                    <img
                      src={imagePreview || getImageUrl(existingImagePath)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-all cursor-pointer"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                      dragOver
                        ? 'border-red-500 bg-red-50/30'
                        : 'border-gray-300 hover:border-red-400 bg-gray-50/50'
                    }`}
                  >
                    <Upload className="text-gray-400 mb-3" size={32} />
                    <p className="text-sm font-bold text-gray-700">Drag & Drop product image here</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    
                    <div className="mt-4">
                      <label className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer block">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkboxes: Featured */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4.5 h-4.5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600"
                  />
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    Mark as Featured Product (Display prominently on Homepage)
                  </span>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-gray-250 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
