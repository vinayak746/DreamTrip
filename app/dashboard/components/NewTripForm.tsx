'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiMapPin, FiImage, FiLoader } from 'react-icons/fi';
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
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Trip</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Trip Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border-2 ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              disabled={isSubmitting}
              aria-invalid={!!formErrors.title}
              aria-describedby={formErrors.title ? 'title-error' : undefined}
            />
            {formErrors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600">
                {formErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell us about your trip..."
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                disabled={isSubmitting}
                aria-invalid={!!formErrors.location}
                aria-describedby={formErrors.location ? 'location-error' : undefined}
                placeholder="Where are you going?"
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
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-3 py-2 border-2 ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-3 py-2 border-2 ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
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
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
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
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isImageUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              disabled={isSubmitting || isImageUploading}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
