'use client';

import { FiX, FiMapPin, FiCalendar, FiClock, FiHeart, FiEdit2 } from 'react-icons/fi';
import { format } from 'date-fns';
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
  onEdit?: () => void;
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

export default function TripPreviewModal({
  trip,
  isOpen,
  onClose,
  onEdit,
  isOwner,
  isFavorite,
  onToggleFavorite
}: TripPreviewModalProps) {
  if (!isOpen) return null;

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black/75" 
          aria-hidden="true" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            {onEdit && isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-colors"
                aria-label="Edit trip"
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-colors"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="relative h-64 w-full">
            <Image
              src={trip.imageUrl || '/placeholder.jpg'}
              alt={trip.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder.jpg';
              }}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{trip.title}</h2>
                  <p className="text-white/90 flex items-center text-sm mt-1">
                    <FiMapPin className="mr-1" size={14} />
                    {trip.location}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(e);
                  }}
                  className={`p-2 rounded-full bg-white/20 backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-white/80 hover:text-white'}`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FiHeart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-white/90">
                <div className="flex items-center mr-4">
                  <FiCalendar className="mr-1" size={14} />
                  <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-1" size={14} />
                  <span>{days} {days === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800">
            {trip.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About this trip</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{trip.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Trip Type</div>
                <div className="mt-1 text-gray-900 dark:text-white">{trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</div>
                <div className="mt-1 text-gray-900 dark:text-white">{days} {days === 1 ? 'day' : 'days'}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</div>
                <div className="mt-1 text-gray-900 dark:text-white">{format(startDate, 'MMM d, yyyy')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</div>
                <div className="mt-1 text-gray-900 dark:text-white">{format(endDate, 'MMM d, yyyy')}</div>
              </div>
            </div>

            {trip.days && trip.days.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Itinerary</h3>
                <div className="space-y-4">
                  {trip.days.map((day, index) => (
                    <div key={index} className="border-l-2 border-indigo-500 pl-4 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">Day {day.day}: {day.location}</div>
                      {day.activities && day.activities.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          {day.activities.map((activity, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && onEdit && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Trip
                </button>
              </div>
            )}

            {trip.description && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">About this trip</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {trip.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
