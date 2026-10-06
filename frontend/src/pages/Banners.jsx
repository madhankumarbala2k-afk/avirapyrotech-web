import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api';
import { Plus, Edit2, Trash2, X, Upload, AlertCircle, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [orderIndex, setOrderIndex] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImagePath, setExistingImagePath] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/banners');
      setBanners(response.data);
    } catch (err) {
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditBannerId(null);
    setTitle('');
    setSubtitle('');
    setOrderIndex(banners.length + 1);
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditBannerId(banner.id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setOrderIndex(banner.orderIndex);
    setIsActive(banner.active);
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath(banner.imagePath || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image exceeds the 5MB file size limit.');
        return;
      }
      
      setFormError('');
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !existingImagePath) {
      setFormError('Banner image is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('orderIndex', orderIndex);
      formData.append('isActive', isActive);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (existingImagePath) {
        formData.append('imagePath', existingImagePath);
      }

      if (editBannerId) {
        await api.put(`/banners/${editBannerId}`, formData);
      } else {
        await api.post('/banners', formData);
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || 'Failed to save banner.');
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert(err.response?.data || 'Deletion failed.');
    }
  };

  const toggleActiveDirectly = async (banner) => {
    try {
      const formData = new FormData();
      formData.append('title', banner.title || '');
      formData.append('subtitle', banner.subtitle || '');
      formData.append('orderIndex', banner.orderIndex);
      formData.append('isActive', !banner.active);
      
      await api.put(`/banners/${banner.id}`, formData);
      fetchBanners();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
            Homepage Banner Management
          </h1>
          <p className="text-gray-500 text-sm font-semibold mt-1">
            Upload rotating sliders, add titles/subtitles, and activate/deactivate them.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-655 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Upload Banner</span>
        </button>
      </div>

      {/* Grid list of Banners */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center">
          <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400 font-bold text-sm">No banners uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group relative"
            >
              {/* Banner Image */}
              <div className="h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                <img
                  src={getImageUrl(banner.imagePath)}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
                
                {/* Active Indicator overlay */}
                <span className={`absolute top-4 left-4 px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 backdrop-blur-md ${
                  banner.active
                    ? 'bg-green-500/10 text-green-300 border-green-500/20'
                    : 'bg-red-500/10 text-red-300 border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${banner.active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span>{banner.active ? 'Active' : 'Inactive'}</span>
                </span>

                <span className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                  Order: {banner.orderIndex}
                </span>
              </div>

              {/* Banner captions & Controls */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-md font-outfit line-clamp-1">
                    {banner.title || <span className="text-gray-300 italic">No Title</span>}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 font-semibold line-clamp-2">
                    {banner.subtitle || <span className="text-gray-350 italic">No Subtitle</span>}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <button
                    onClick={() => toggleActiveDirectly(banner)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                      banner.active
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 border-gray-250 hover:bg-gray-100'
                    }`}
                  >
                    {banner.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{banner.active ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all cursor-pointer"
                      title="Edit text/image"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 font-outfit font-outfit">
                {editBannerId ? 'Edit Carousel Banner' : 'Upload Slider Banner'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-455 hover:text-gray-800 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl text-sm font-semibold animate-fade-in">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Banner Main Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwal Crackers Megastore"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Banner Subtitle / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Get up to 75% flat discount directly from Sivakasi!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* Grid: Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                  />
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4.5 h-4.5 text-red-650 border-gray-300 rounded focus:ring-red-500 accent-red-600"
                    />
                    <span className="ml-2 text-sm font-bold text-gray-650">
                      Show on Home (Active)
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Banner Image *
                </label>

                {imagePreview || existingImagePath ? (
                  <div className="relative w-full h-36 border border-gray-250 rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={imagePreview || getImageUrl(existingImagePath)}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="py-2.5 px-4 bg-gray-50 border border-gray-250 text-gray-750 text-xs font-bold rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2">
                      <Upload size={14} />
                      <span>Select Banner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 font-semibold">Landscape image recommended (Max 5MB)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-250 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Save Banner</span>
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
