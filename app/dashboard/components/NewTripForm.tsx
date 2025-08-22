'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiMapPin, FiImage, FiLoader, FiPlus } from 'react-icons/fi';
import { getTripImage } from '@/utils/tripImages';

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

interface TripFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
}

interface ExtendedTripFormData extends TripFormData {
  imageFile?: File;
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
  imageFile: undefined
};

export default function NewTripForm({ onClose, onSubmit, isSubmitting = false }: NewTripFormProps) {
  const [formData, setFormData] = useState<ExtendedTripFormData>(DEFAULT_FORM_DATA);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ExtendedTripFormData) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 5;
    
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({
        ...prev,
        imageUrl: 'Please upload a valid image (JPEG, PNG, or WebP)'
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

    setIsImageUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result as string,
        imageFile: file
      }));
      setFormErrors(prev => ({ ...prev, imageUrl: '' }));
      setIsImageUploading(false);
    };
    
    reader.onerror = () => {
      setFormErrors(prev => ({
        ...prev,
        imageUrl: 'Error reading image file'
      }));
      setIsImageUploading(false);
    };
    
    reader.readAsDataURL(file);
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData(DEFAULT_FORM_DATA);
      setFormErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is done in the parent component
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

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm resize-none"
                  placeholder="Tell us about your trip..."
                />
              </div>
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
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900"
                disabled={isSubmitting}
              >
                <option value="leisure">🏖️ Leisure</option>
                <option value="business">💼 Business</option>
                <option value="adventure">🌋 Adventure</option>
                <option value="hiking">🥾 Hiking</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Image
              </label>
              <div className="mt-1 flex items-start">
                <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-100">
                  {isImageUploading ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                      <FiLoader className="animate-spin h-6 w-6 text-gray-500" />
                    </div>
                  ) : (
                    <img
                      src={formData.imageUrl || getTripImage(formData.type)}
                      alt="Trip preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getTripImage(formData.type);
                      }}
                    />
                  )}
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-100 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                    {formData.imageFile ? 'Change Image' : 'Upload Image'}
                    <input 
                      type="file" 
                      className="sr-only" 
                      onChange={handleImageChange} 
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isImageUploading || isSubmitting}
                    />
                  </label>
                  {formData.imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          imageFile: undefined,
                          imageUrl: getTripImage(prev.type)
                        }));
                        setFormErrors(prev => ({ ...prev, imageUrl: '' }));
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-100 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {formErrors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.imageUrl}
                </p>
              )}
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
