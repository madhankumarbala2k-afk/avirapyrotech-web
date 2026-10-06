import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api';
import { Plus, Edit2, Trash2, X, Upload, AlertCircle, Folder } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImagePath, setExistingImagePath] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditCategoryId(null);
    setName('');
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditCategoryId(category.id);
    setName(category.name);
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath(category.imagePath || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
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
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (existingImagePath) {
        formData.append('imagePath', existingImagePath);
      }

      if (editCategoryId) {
        await api.put(`/categories/${editCategoryId}`, formData);
      } else {
        await api.post('/categories', formData);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || 'Failed to save category. Make sure the name is unique.');
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? All products under it will require category reassignment.")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data || 'Deletion failed. Some products might still belong to this category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-outfit">
            Category Management
          </h1>
          <p className="text-gray-500 text-sm font-semibold mt-1">
            Group your crackers into categories (e.g. rockets, sparklers, chakkars).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center">
          <Folder className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400 font-bold text-sm">No categories created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              {/* Category Cover Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                {category.imagePath ? (
                  <img
                    src={getImageUrl(category.imagePath)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-350 flex flex-col items-center gap-1 select-none">
                    <Folder size={32} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Cover Image</span>
                  </div>
                )}
              </div>

              {/* Category Details */}
              <div className="p-4 flex items-center justify-between">
                <span className="font-bold text-gray-800 font-outfit">{category.name}</span>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all cursor-pointer"
                    title="Edit Name/Photo"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 font-outfit">
                {editCategoryId ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-450 hover:text-gray-800 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl text-sm font-semibold">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Chakkars"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Category Cover Image (Optional)
                </label>

                {imagePreview || existingImagePath ? (
                  <div className="relative w-36 h-36 border border-gray-250 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={imagePreview || getImageUrl(existingImagePath)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="py-2.5 px-4 bg-gray-50 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2">
                      <Upload size={14} />
                      <span>Upload cover image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 font-semibold">Max size: 5MB (PNG/JPG)</span>
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
                    <span>Save Category</span>
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
