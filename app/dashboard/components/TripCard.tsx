import Image from 'next/image';
import { FiMapPin, FiCalendar, FiClock, FiArrowRight, FiMoreVertical } from 'react-icons/fi';

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

  // Calculate days between dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-100">
      <div className="relative h-48">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Top right menu */}
        <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors">
          <FiMoreVertical size={18} />
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
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {days} {days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <FiCalendar className="mr-1.5 text-indigo-600" size={14} />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1.5 text-indigo-600" size={14} />
            <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(id)}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 group"
        >
          View Details
          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" size={16} />
        </button>
      </div>
    </div>
  );
}
