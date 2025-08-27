'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiMapPin, FiImage, FiLoader, FiPlus, FiTag } from 'react-icons/fi';
import { getTripImage } from '@/utils/tripImages';
import { TripType } from '@/types/trip';

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

interface TripFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
}

interface ExtendedTripFormData extends Omit<TripFormData, 'imageFiles' | 'imageUrls'> {
  imageFile?: File;
  imageFiles?: File[];
  imageUrls: string[];
}

interface NewTripFormProps {
  onClose: () => void;
  onSubmit: (trip: ExtendedTripFormData) => Promise<any>;
  isSubmitting?: boolean;
}

const DEFAULT_FORM_DATA: ExtendedTripFormData = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  type: 'leisure',
  imageUrl: getTripImage('leisure'),
  imageFile: undefined,
  imageUrls: [],
  imageFiles: []
};

export default function NewTripForm({ onClose, onSubmit, isSubmitting: isSubmittingProp = false }: NewTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(isSubmittingProp);
  const [formData, setFormData] = useState<ExtendedTripFormData>({
    ...DEFAULT_FORM_DATA,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TripFormData, string>>>({});
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Update image URL when trip type changes
  useEffect(() => {
    if (!formData.imageFile) {
      setFormData(prev => ({
        ...prev,
        imageUrl: getTripImage(prev.type)
      }));
    }
  }, [formData.type, formData.imageFile]);

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
      imageFiles: prev.imageFiles?.filter((_, i) => i !== index) || []
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ExtendedTripFormData) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 5;
    const maxFiles = 10;
    
    // Check number of files
    const totalFiles = (formData.imageFiles?.length || 0) + files.length;
    if (totalFiles > maxFiles) {
      setFormErrors(prev => ({
        ...prev,
        imageUrl: `You can upload a maximum of ${maxFiles} images`
      }));
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          imageUrl: 'Only JPG, PNG, and WebP images are allowed'
        }));
        return;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          imageUrl: `Image size should be less than ${maxSizeMB}MB`
        }));
        return;
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
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload any new images
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
      
      // Create a clean trip data object without File objects
      const tripData = {
        title: formData.title.trim(),
        description: formData.description || '',
        location: formData.location.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        imageUrl: imageUrls[0], // Keep for backward compatibility
        imageUrls: imageUrls,
        // Don't include imageFiles in the final data
      };
      
      console.log('Submitting trip with data:', {
        ...tripData,
        imageUrls: imageUrls.map(url => url.substring(0, 30) + '...') // Log a preview of URLs
      });
      
      await onSubmit(tripData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create trip. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Plan Your Next Trip</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in the details to create your perfect itinerary</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
              disabled={isSubmitting}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Trip Title <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border-2 ${
                    formErrors.title ? 'border-red-400' : 'border-gray-100 hover:border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm`}
                  disabled={isSubmitting}
                  placeholder="e.g., Summer Vacation 2024"
                  aria-invalid={!!formErrors.title}
                  aria-describedby={formErrors.title ? 'title-error' : undefined}
                />
              </div>
              {formErrors.title && (
                <p id="title-error" className="mt-1 text-sm text-red-600">
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Images
              </label>
              <div className="mt-1 flex items-start">
                <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-100">
                  {isImageUploading ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                      <FiLoader className="animate-spin h-6 w-6 text-gray-500" />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                      <FiImage className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-100 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                    Upload Images
                    <input 
                      type="file" 
                      className="sr-only" 
                      onChange={handleImageChange} 
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={isImageUploading || isSubmitting}
                    />
                  </label>
                  {formData.imageUrls?.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {formData.imageUrls.length} image{formData.imageUrls.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
              {formErrors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.imageUrl}
                </p>
              )}
              {formData.imageUrls?.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Trip image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiMapPin className="absolute left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white border-2 ${
                    formErrors.location ? 'border-red-400' : 'border-gray-100 hover:border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm`}
                  disabled={isSubmitting}
                  placeholder=""
                  aria-invalid={!!formErrors.location}
                  aria-describedby={formErrors.location ? 'location-error' : undefined}
                />
              </div>
              {formErrors.location && (
                <p id="location-error" className="mt-1 text-sm text-red-600">
                  {formErrors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  {/* <FiCalendar className="absolute left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} /> */}
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      formErrors.startDate ? 'border-red-400' : 'border-gray-100 hover:border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 
                    [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-datetime-edit-text]:text-gray-400
                    [&::-webkit-datetime-edit-month-field]:text-gray-400
                    [&::-webkit-datetime-edit-day-field]:text-gray-400
                    [&::-webkit-datetime-edit-year-field]:text-gray-400`}
                    disabled={isSubmitting}
                    aria-invalid={!!formErrors.startDate}
                    aria-describedby={formErrors.startDate ? 'startDate-error' : undefined}
                  />
                </div>
                {formErrors.startDate && (
                  <p id="startDate-error" className="mt-1 text-sm text-red-600">
                    {formErrors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  {/* <FiCalendar className="absolute left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} /> */}
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      formErrors.endDate ? 'border-red-400' : 'border-gray-100 hover:border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900
                    [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-datetime-edit-text]:text-gray-400
                    [&::-webkit-datetime-edit-month-field]:text-gray-400
                    [&::-webkit-datetime-edit-day-field]:text-gray-400
                    [&::-webkit-datetime-edit-year-field]:text-gray-400`}
                    disabled={isSubmitting || !formData.startDate}
                    aria-invalid={!!formErrors.endDate}
                    aria-describedby={formErrors.endDate ? 'endDate-error' : undefined}
                  />
                </div>
                {formErrors.endDate && (
                  <p id="endDate-error" className="mt-1 text-sm text-red-600">
                    {formErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Type
              </label>
              <div className="relative group">
                <FiTag className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none"
                  disabled={isSubmitting}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {typeIcons[value as keyof typeof typeIcons]} {label}
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


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-medium hover:shadow-md hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center h-[46px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <FiLoader className="animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiPlus className="mr-2" />
                      Create Trip
                    </span>
                  )}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-white text-gray-600 py-3.5 px-6 border-2 border-gray-100 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 h-[46px]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
