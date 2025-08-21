import { FiMapPin, FiCalendar, FiClock, FiHeart } from 'react-icons/fi';

interface Activity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
}

interface ItineraryCardProps {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: string;
  activities: Activity[];
  isFavorite: boolean;
  coverImage?: string;
  onToggleFavorite: (id: string) => void;
}

export default function ItineraryCard({
  id,
  title,
  destination,
  startDate,
  endDate,
  type,
  activities,
  isFavorite,
  coverImage,
  onToggleFavorite,
}: ItineraryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {coverImage && (
        <div className="h-40 bg-gray-200 relative">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onToggleFavorite(id)}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isFavorite ? 'text-red-500' : 'text-white bg-black bg-opacity-40'
            }`}
          >
            <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {type}
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span>{destination}</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span>
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>
        {activities.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Activities:</h4>
            <ul className="space-y-1">
              {activities.slice(0, 2).map((activity) => (
                <li key={activity.id} className="flex items-center text-sm text-gray-600">
                  <FiClock className="flex-shrink-0 mr-1.5 h-3 w-3 text-gray-400" />
                  <span className="truncate">{activity.name}</span>
                </li>
              ))}
              {activities.length > 2 && (
                <li className="text-xs text-indigo-600">+{activities.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
