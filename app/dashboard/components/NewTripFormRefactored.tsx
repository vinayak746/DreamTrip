'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TripType } from '@/types/trip';
import { getTripImage } from '@/utils/tripImages';
import { TripBasicInfoForm } from './forms/TripBasicInfoForm';
import { TripTypeSelector } from './forms/TripTypeSelector';
import { TripDateRange } from './forms/TripDateRange';
import { TripImageUploader } from './forms/TripImageUploader';
import { TripDescription } from './forms/TripDescription';
import { TripPrivacySettings } from './forms/TripPrivacySettings';
import { FormActions } from './forms/FormActions';

import { TripBudget } from '@/types/trip';
import { TripItineraryPlanner } from './forms/TripItineraryPlanner';

import { TripFormData as SharedTripFormData, TripDay as SharedTripDay } from '@/types/trip';

type TripDay = Omit<SharedTripDay, 'date'> & { date?: string };

export interface TripFormData extends Omit<SharedTripFormData, 'isFavorite' | 'days'> {
  days: TripDay[];
  // Any additional fields specific to the form can be added here
}

interface NewTripFormProps {
  onClose: () => void;
  onSubmit: (trip: TripFormData) => Promise<any>;
  isSubmitting?: boolean;
  initialData?: Partial<TripFormData>;
}

const DEFAULT_FORM_DATA: TripFormData = {
  // Basic trip info
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  type: 'leisure',
  
  // Images
  imageUrl: getTripImage('leisure'),
  imageUrls: [],
  coverImageIndex: 0,
  
  // Metadata
  isPublic: true,
  tags: [],
  
  // Itinerary
  days: [],
  
  // Budget
  budget: {
    total: 0,
    currency: 'USD',
    expenses: []
  },
  
  // Collaboration
  collaborators: [],
  
  // System fields
  saved: 0,
  userId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
} as TripFormData;

export function NewTripFormRefactored({ onClose, onSubmit, isSubmitting = false, initialData = {} }: NewTripFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<TripFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const router = useRouter();

  // Update image URL when trip type changes
  useEffect(() => {
    if (!formData.imageUrls?.length && !initialData.imageUrl) {
      setFormData(prev => ({
        ...prev,
        imageUrl: getTripImage(prev.type)
      }));
    }
  }, [formData.type, formData.imageUrls, initialData.imageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type: TripType) => {
    setFormData(prev => ({
      ...prev,
      type,
      imageUrl: getTripImage(type)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newImageUrls = [...(formData.imageUrls || [])];
    let newCoverImageIndex = formData.coverImageIndex;

    try {
      setIsImageUploading(true);
      
      // In a real app, you would upload the files to a storage service here
      // For now, we'll just create object URLs for preview
      const newUrls = files.map(file => URL.createObjectURL(file));
      
      // If this is the first image being uploaded, set it as cover
      if (newImageUrls.length === 0 && newUrls.length > 0) {
        newCoverImageIndex = 0;
      }
      
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls || [], ...newUrls],
        imageUrl: newUrls[0] || prev.imageUrl,
        coverImageIndex: newCoverImageIndex
      }));
      
    } catch (error) {
      console.error('Error uploading images:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = [...(formData.imageUrls || [])];
    const removedUrl = newImageUrls.splice(index, 1)[0];
    
    // Revoke the object URL to avoid memory leaks
    if (removedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedUrl);
    }
    
    // If we removed the cover image, set a new cover image
    let newCoverImageIndex = formData.coverImageIndex;
    if (index === formData.coverImageIndex && newImageUrls.length > 0) {
      newCoverImageIndex = 0;
    } else if (index < formData.coverImageIndex) {
      newCoverImageIndex = Math.max(0, formData.coverImageIndex - 1);
    }
    
    setFormData(prev => ({
      ...prev,
      imageUrls: newImageUrls,
      imageUrl: newImageUrls[newCoverImageIndex] || getTripImage(prev.type),
      coverImageIndex: newCoverImageIndex
    }));
  };

  const handleSetCoverImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coverImageIndex: index,
      imageUrl: prev.imageUrls?.[index] || prev.imageUrl
    }));
  };

  const handleTogglePrivacy = (isPublic: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPublic
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <TripBasicInfoForm 
          formData={{
            title: formData.title,
            location: formData.location,
            type: formData.type
          }} 
          onInputChange={handleInputChange} 
        />
        
        <TripDateRange 
          startDate={formData.startDate}
          endDate={formData.endDate}
          onDateChange={handleInputChange}
        />
        
        <TripTypeSelector 
          selectedType={formData.type}
          onTypeChange={handleTypeChange}
        />
        
        <TripImageUploader
          imageUrls={formData.imageUrls}
          coverImageIndex={formData.coverImageIndex}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          onSetCoverImage={handleSetCoverImage}
          isUploading={isImageUploading}
        />
        
        <TripDescription 
          description={formData.description}
          onDescriptionChange={handleInputChange}
        />
        
        {activeStep === 1 && (
          <div className="space-y-6">
            <TripPrivacySettings
              isPublic={formData.isPublic}
              onTogglePrivacy={(isPublic) =>
                setFormData({ ...formData, isPublic })
              }
            />
            
            <div className="pt-4 border-t">
              <TripItineraryPlanner
                days={formData.days}
                onChange={(days) => setFormData({ ...formData, days })}
              />
            </div>
          </div>
        )}
      </div>
      
      <FormActions 
        onCancel={onClose}
        isSubmitting={isSubmitting || isImageUploading}
        submitLabel={initialData?.title ? 'Update Trip' : 'Create Trip'}
      />
    </form>
  );
}
