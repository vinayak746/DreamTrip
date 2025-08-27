'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiMapPin, FiImage, FiTag, FiEdit2, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi';
import { getTripImage } from '@/utils/tripImages';
import { TripType } from '@/types/trip';

interface TripFormData {
  id: string;
  title: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  imageUrls?: string[];
  userId: string;
  imageFiles?: File[];
}

interface EditTripFormProps {
  initialData: TripFormData;
  onSubmit: (trip: TripFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<boolean>;
}

const typeIcons = {
  leisure: '🏖️',
  business: '💼',
  adventure: '🌋',
  hiking: '🥾',
  family: '👨‍👩‍👧‍👦',
  roadtrip: '🚗',
  beach: '🏝️',
  mountain: '⛰️',
  city: '🏙️',
  cruise: '🚢',
  solo: '🧳',
  other: '✈️'
};

const typeLabels = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  hiking: 'Hiking',
  family: 'Family',
  roadtrip: 'Road Trip',
  beach: 'Beach',
  mountain: 'Mountain',
  city: 'City',
  cruise: 'Cruise',
  solo: 'Solo',
  other: 'Other'
};

export default function EditTripForm({ initialData, onSubmit, onCancel, onDelete }: EditTripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    ...initialData,
    imageUrls: initialData.imageUrls || [initialData.imageUrl],
    imageFiles: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TripFormData, string>>>({});

  // Update form data when initialData prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...initialData,
      imageUrls: initialData.imageUrls || [initialData.imageUrl],
      imageFiles: prev.imageFiles || []
    }));
  }, [initialData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxFiles = 10 - (formData.imageUrls?.length || 0);
    if (files.length > maxFiles) {
      setFormErrors(prev => ({
        ...prev,
        imageUrl: `You can only upload up to ${maxFiles} more images`
      }));
      return;
    }

    const validFiles: File[] = [];
    const maxSizeMB = 5;

    for (const file of files) {
      if (!file.type.match('image.*')) {
        setFormErrors(prev => ({
          ...prev,
          imageUrl: 'Only image files are allowed (JPEG, PNG, WebP)'
        }));
        continue;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          imageUrl: `Image size should be less than ${maxSizeMB}MB`
        }));
        continue;
      }
      validFiles.push(file);
    }

    // Add files to state for preview
    setFormData(prev => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...validFiles]
    }));
    
    setFormErrors(prev => ({ ...prev, imageUrl: '' }));
    
    // Upload files if we have valid ones
    if (validFiles.length > 0) {
      setIsImageUploading(true);
      
      try {
        const { uploadTripImages } = await import('@/services/storageService');
        const uploadedUrls = await uploadTripImages(validFiles);
        
        // Update with the actual Cloudinary URLs
        setFormData(prev => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), ...uploadedUrls]
        }));
        
      } catch (error) {
        console.error('Error uploading images:', error);
        setFormErrors(prev => ({
          ...prev,
          imageUrl: error instanceof Error ? error.message : 'Failed to upload images. Please try again.'
        }));
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number, isNew = false) => {
    if (isNew) {
      // Remove from new files
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles?.filter((_, i) => i !== index) || []
      }));
    } else {
      // Remove from existing URLs
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof TripFormData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be before start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload any new images if there are any
      let imageUrls = [...(formData.imageUrls || [])];
      
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        const { uploadTripImages } = await import('@/services/storageService');
        const newImageUrls = await uploadTripImages(formData.imageFiles);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      // Ensure we have at least one image URL
      if (imageUrls.length === 0) {
        imageUrls = [getTripImage(formData.type)];
      }
      
      // Prepare the trip data with the updated image URLs
      const tripData: TripFormData = {
        ...formData,
        imageUrls,
        imageUrl: imageUrls[0], // Keep imageUrl for backward compatibility
        // Ensure all required fields are included
        title: formData.title.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        description: formData.description || ''
      };
      
      await onSubmit(tripData);
    } catch (error) {
      console.error('Error updating trip:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Failed to update trip. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this trip? This action cannot be undone.');
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Trip</h2>
          <button 
            onClick={onCancel} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Preview */}
          <div className="group relative h-48 w-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            <img 
              src={formData.imageUrl || getTripImage(formData.type)}
              alt={formData.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getTripImage(formData.type);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">{typeIcons[formData.type]}</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{formData.type}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Title</label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
                placeholder="Enter trip title"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Where are you going?"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Type</label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-gray-900"
                  style={{ paddingRight: '2.5rem' }}
                  disabled={isSubmitting}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formatDateForInput(formData.startDate)}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-gray-900"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formatDateForInput(formData.endDate)}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-gray-900"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
                placeholder="Add a description (optional)"
                disabled={isSubmitting}
              ></textarea>
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {formData.description?.length || 0}/500
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Images (Max 10)</label>
            
            {/* Image Grid */}
            {((formData.imageUrls && formData.imageUrls.length > 0) || (formData.imageFiles && formData.imageFiles.length > 0)) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                {/* Existing Images */}
                {formData.imageUrls?.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img 
                      src={url} 
                      alt={`Trip image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, false)}
                      className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Newly Uploaded Images */}
                {formData.imageFiles?.map((file, index) => (
                  <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`New image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
              <div className="space-y-1 text-center">
                <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload files</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={isSubmitting || isImageUploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    {isImageUploading ? (
                      <span className="flex items-center">
                        <FiLoader className="animate-spin mr-2" /> Uploading...
                      </span>
                    ) : (
                      'Drag and drop images here, or click to select (PNG, JPG, GIF up to 5MB each)'
                    )}
                  </p>
                </div>
                {formErrors.imageUrl && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.imageUrl}</p>
                )}
              </div>
            </div>
            
            {formData.imageUrls && formData.imageUrls.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Click on an image to remove it. At least one image is required.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete Trip
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
