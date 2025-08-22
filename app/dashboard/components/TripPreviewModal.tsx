'use client';

import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiCalendar, FiClock, FiHeart, FiEdit2, FiExternalLink } from 'react-icons/fi';
import { format, formatDistance } from 'date-fns';
import Image from 'next/image';
import { TripType } from '@/types/trip';

interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  saved?: number;
  userId: string;
  days?: Array<{
    day: number;
    location: string;
    activities: string[];
  }>;
}

interface TripPreviewModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (trip: Trip) => void;
  isOwner: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const typeIcons = {
  leisure: '🏖️',
  business: '💼',
  adventure: '🌋',
  hiking: '🥾',
  family: '👨‍👩‍👧‍👦'
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    leisure: 'Leisure',
    business: 'Business',
    adventure: 'Adventure',
    hiking: 'Hiking',
    family: 'Family'
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

export default function TripPreviewModal({
  trip,
  isOpen,
  onClose,
  onEdit,
  isOwner,
  isFavorite,
  onToggleFavorite
}: TripPreviewModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isOpen || !isMounted) return null;

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const formattedDateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  const formattedYear = format(startDate, 'yyyy');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-20 flex space-x-2">
            <button
              onClick={onClose}
              className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Image */}
          <div className="relative h-72 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <Image
              src={trip.imageUrl || '/placeholder.jpg'}
              alt={trip.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder.jpg';
              }}
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Header Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-2xl mr-2">{typeIcons[trip.type] || '✈️'}</span>
                    <span className="text-sm font-medium text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {getTypeLabel(trip.type)}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">{trip.title}</h2>
                  <div className="flex items-center mt-2 text-white/90">
                    <FiMapPin className="mr-1.5 flex-shrink-0" size={14} />
                    <span className="truncate">{trip.location}</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                  {onEdit && isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(trip);
                      }}
                      className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all hover:scale-110"
                      aria-label="Edit trip"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(e);
                    }}
                    className={`p-2.5 rounded-full shadow-lg transition-all hover:scale-110 ${
                      isFavorite 
                        ? 'bg-red-500/90 hover:bg-red-600 text-white' 
                        : 'bg-white/90 hover:bg-white text-gray-800'
                    }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              
              {/* Date Info */}
              <div className="mt-4 flex flex-wrap items-center text-sm text-white/90">
                <div className="flex items-center mr-4 mb-2">
                  <FiCalendar className="mr-1.5 flex-shrink-0" size={14} />
                  <span>{formattedDateRange}</span>
                  <span className="mx-1.5">•</span>
                  <span>{formattedYear}</span>
                </div>
                <div className="flex items-center mb-2">
                  <FiClock className="mr-1.5 flex-shrink-0" size={14} />
                  <span>{days} {days === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Description */}
            {trip.description && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                  About This Trip
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {trip.description}
                </p>
              </div>
            )}

            {/* Trip Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Trip Type</div>
                <div className="flex items-center text-gray-900 dark:text-white font-medium">
                  <span className="text-lg mr-2">{typeIcons[trip.type] || '✈️'}</span>
                  {getTypeLabel(trip.type)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {days} {days === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Starts</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {format(startDate, 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ends</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {format(endDate, 'MMMM d, yyyy')}
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {trip.days && trip.days.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                  Trip Itinerary
                </h3>
                <div className="space-y-4">
                  {trip.days.map((day, index) => (
                    <div 
                      key={index} 
                      className="group relative pl-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors"
                    >
                      <div className="absolute left-0 top-6 w-0.5 h-[calc(100%-1.5rem)] bg-gray-200 dark:bg-gray-600"></div>
                      <div className="absolute left-0 top-6 -ml-2.5 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-800"></div>
                      
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium">
                            {day.day}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                            {day.location}
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                              {format(new Date(trip.startDate).setDate(new Date(trip.startDate).getDate() + day.day - 1), 'MMM d')}
                            </span>
                          </h4>
                          
                          {day.activities && day.activities.length > 0 && (
                            <ul className="space-y-2 mt-2">
                              {day.activities.map((activity, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2.5 mr-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                                  <span className="text-gray-600 dark:text-gray-300">{activity}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-8">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit?.(trip)}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <FiEdit2 className="mr-2 h-4 w-4" />
                    Edit Trip
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
