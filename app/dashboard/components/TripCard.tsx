import Image from 'next/image';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

interface TripCardProps {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  onViewDetails: (id: string) => void;
}

export default function TripCard({
  id,
  title,
  location,
  startDate,
  endDate,
  imageUrl,
  onViewDetails,
}: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <div className="relative h-48">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          <div className="flex items-center text-sm opacity-90">
            <FiMapPin className="mr-1.5" size={14} />
            <span>{location}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <FiCalendar className="mr-1.5" size={14} />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1.5" size={14} />
            <span>5 days</span>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(id)}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
        >
          View Details
          <FiArrowRight className="ml-2" size={16} />
        </button>
      </div>
    </div>
  );
}
