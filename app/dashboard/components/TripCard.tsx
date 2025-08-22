import React from 'react';
import Image from 'next/image';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight, FiMoreVertical, FiCompass, FiTrendingUp, FiStar } from 'react-icons/fi';
import { getTripImage } from '@/utils/tripImages';

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
  saved?: number;
  onViewDetails: (id: string) => void;
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

export default function TripCard({
  id,
  title,
  location,
  startDate,
  endDate,
  imageUrl,
  type,
  saved = 0,
  onViewDetails,
}: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate days between dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Use the provided image URL or fall back to the default for the trip type
  const displayImageUrl = imageUrl || getTripImage(type);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={displayImageUrl}
          alt={`${title} trip`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Top right save button */}
        <button 
          className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors group"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement save functionality
            console.log('Save trip:', id);
          }}
        >
          <FiStar 
            size={18} 
            className={saved > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 group-hover:text-yellow-500'} 
          />
          {saved > 0 && (
            <span className="absolute -bottom-2 -right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {saved}
            </span>
          )}
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-1">{title}</h3>
              <div className="flex items-center text-sm opacity-90">
                <FiMapPin className="mr-1.5 flex-shrink-0" size={14} />
                <span className="truncate">{location}</span>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium border border-gray-200 text-gray-800">
              {days} {days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t-2 border-gray-100">
        <div className="flex justify-between items-center text-sm text-gray-700 mb-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {typeIcons[type]}
              <span className="ml-1">{typeLabels[type]}</span>
            </span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center text-gray-600">
              <FiCalendar className="mr-1.5 text-indigo-500" size={14} />
              <span>
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <FiClock className="mr-1.5 text-indigo-500" size={14} />
            <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(id)}
            className="flex-1 flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 group"
          >
            View Details
            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" size={16} />
          </button>
          <button 
            className="p-2.5 rounded-lg border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement more options menu
              console.log('More options for trip:', id);
            }}
          >
            <FiMoreVertical size={16} className="group-hover:text-indigo-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
