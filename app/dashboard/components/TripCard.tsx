import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight, FiMoreVertical, FiCompass, FiTrendingUp, FiStar, FiHeart, FiEdit2 } from 'react-icons/fi';
import { getTripImage } from '@/utils/tripImages';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/firebase/config';
import TripPreviewModal from './TripPreviewModal';

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

// Define a type for the typeIcons and typeLabels objects
type TripTypeIcons = {
  [key in TripType]: React.ReactNode;
};

type TripTypeLabels = {
  [key in TripType]: string;
};

interface TripCardProps {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  type: TripType;
  description?: string;
  saved?: number;
  userId: string;
  onViewDetails: (id: string) => void;
  onFavoriteToggle?: (tripId: string, isFavorite: boolean) => Promise<boolean>;
  onEdit?: (trip: any) => void;
  isFavorite?: boolean;
}

const typeIcons: TripTypeIcons = {
  leisure: <FiStar className="text-yellow-500" />,
  business: <FiTrendingUp className="text-blue-500" />,
  adventure: <FiCompass className="text-emerald-500" />,
  hiking: <FiMapPin className="text-red-500" />,
  family: <FiStar className="text-purple-500" />
};

const typeLabels: TripTypeLabels = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  hiking: 'Hiking',
  family: 'Family'
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function TripCard({
  id,
  title,
  location,
  startDate,
  endDate,
  description = '',
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
  imageUrl,
  type,
  saved = 0,
  userId,
  onViewDetails,
  onEdit,
}: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate days between dates
  const start = new Date(startDate);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [displayImage, setDisplayImage] = useState(imageUrl || getTripImage(type));
  const [showPreview, setShowPreview] = useState(false);
  const isOwner = user?.uid === userId;

  const days = []; // This should be passed as a prop if needed

  // Sync with parent component's favorite state
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleCardClick = () => {
    setShowPreview(true);
  };

  const handleImageError = () => {
    if (!imageError) {
      setDisplayImage(getTripImage(type));
      setImageError(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit({
        id,
        title,
        location,
        startDate,
        endDate,
        description,
        type,
        imageUrl: displayImage,
        userId
      });
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFavoriteToggle) return;
    
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    try {
      const success = await onFavoriteToggle(id, newFavoriteState);
      if (!success) {
        // Revert if the toggle was not successful
        setIsFavorite(!newFavoriteState);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert on error
      setIsFavorite(!newFavoriteState);
    }
  };

  return (
    <div className="relative">
      <div 
        className="card bg-card-bg border border-card-border hover:shadow-md transition-shadow duration-300 relative overflow-hidden h-full flex flex-col"
      >
        {isOwner && onEdit && (
          <div className="absolute top-2 right-2 flex space-x-2 z-10">
            <button
              onClick={handleEditClick}
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              aria-label="Edit trip"
            >
              <FiEdit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-white/80 hover:text-white'} bg-black/20 backdrop-blur-sm`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        <div 
          className="relative h-48 w-full cursor-pointer" 
          onClick={handleCardClick}
        >
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-foreground line-clamp-2">{title}</h3>
              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                {typeIcons[type as keyof typeof typeIcons]}
                <span className="text-sm text-muted-foreground">
                  {typeLabels[type as keyof typeof typeLabels]}
                </span>
              </div>
            </div>
            
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <FiMapPin className="mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <FiCalendar className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <FiClock className="mr-1" />
              <span>{days?.length || 0} day{days?.length !== 1 ? 's' : ''}</span>
            </div>
            
            {saved > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Saved ${saved}
              </span>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <TripPreviewModal
          trip={{
            id,
            title,
            location,
            startDate,
            endDate,
            type,
            imageUrl: displayImage,
            description: description || '',
            days: [],
            userId,
            saved
          }}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onEdit={onEdit ? () => onEdit({
            id,
            title,
            location,
            startDate,
            endDate,
            type,
            imageUrl: displayImage,
            description: description || '',
            days: []
          }) : undefined}
          isOwner={isOwner}
          isFavorite={isFavorite}
          onToggleFavorite={handleFavoriteClick}
        />
      )}
    </div>
  );
}
