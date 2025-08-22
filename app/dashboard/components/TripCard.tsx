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
  leisure: '🏖️',
  business: '💼',
  adventure: '🌋',
  hiking: '🥾',
  family: '👨‍👩‍👧‍👦'
};

const typeLabels: TripTypeLabels = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  hiking: 'Hiking',
  family: 'Family'
};

const typeColors = {
  leisure: 'bg-amber-50 text-amber-700 border border-amber-100',
  business: 'bg-blue-50 text-blue-700 border border-blue-100',
  adventure: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  hiking: 'bg-red-50 text-red-700 border border-red-100',
  family: 'bg-purple-50 text-purple-700 border border-purple-100'
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
    <div className="group relative h-full">
      <div 
        className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all duration-300 border border-gray-100/80 hover:border-gray-200/80"
      >
        {/* Image with overlay */}
        <div 
          className="relative h-48 w-full cursor-pointer overflow-hidden"
          onClick={handleCardClick}
        >
          <div className="relative w-full h-full">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
          
          {/* Top right actions */}
          <div className="absolute top-3 right-3 flex space-x-2 z-10">
            {isOwner && onEdit && (
              <button
                onClick={handleEditClick}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-sm hover:shadow-md text-gray-600 hover:text-gray-800"
                aria-label="Edit trip"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isFavorite 
                  ? 'bg-white/90 text-red-500 shadow-sm' 
                  : 'bg-white/80 text-gray-400 hover:bg-white/90 hover:text-red-500'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pt-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <h3 className="text-lg font-semibold text-white line-clamp-2 tracking-tight">{title}</h3>
            <div className="flex items-center mt-1.5 text-white/90">
              <FiMapPin className="mr-1.5 flex-shrink-0 w-3.5 h-3.5" />
              <span className="text-sm font-medium tracking-wide truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                typeColors[type as keyof typeof typeColors]
              }`}>
                {typeIcons[type as keyof typeof typeIcons]}
                <span className="ml-1.5">{typeLabels[type as keyof typeof typeLabels]}</span>
              </span>
              {saved > 0 && (
                <span className="text-sm text-gray-500 flex items-center">
                  <FiStar className="text-yellow-400 mr-1" size={14} />
                  {saved}
                </span>
              )}
            </div>
            
            <div className="mt-3 flex items-center text-sm text-gray-500 font-medium">
              <FiCalendar className="mr-2 flex-shrink-0 text-gray-400" size={14} />
              <span className="tracking-wide">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
            
            {description && (
              <p className="mt-3 text-sm text-gray-500/90 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100/70 flex justify-between items-center">
            <div className="text-sm text-gray-400 font-medium">
              {days.length} day{days.length !== 1 ? 's' : ''} • {location.split(',')[0]}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(id);
              }}
              className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors px-3 py-1.5 -mr-2 rounded-lg hover:bg-blue-50/50"
            >
              View Details
              <FiArrowRight className="ml-1.5" size={14} />
            </button>
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
          onEdit={onEdit ? (trip) => onEdit({
            id,
            title: trip.title,
            location: trip.location,
            startDate: trip.startDate,
            endDate: trip.endDate,
            type: trip.type,
            imageUrl: displayImage,
            description: trip.description || '',
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
