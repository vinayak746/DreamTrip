'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHeart, FiMapPin, FiCalendar, FiStar } from 'react-icons/fi';

// Define types
type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  saved: number;
  days: Array<{
    day: number;
    location: string;
    activities: string[];
  }>;
}

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mock data - replace with actual data from your state management
  const favoriteTrips: Trip[] = [
    {
      id: '1',
      title: 'Sample Trip',
      location: 'Sample Location',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      type: 'leisure',
      imageUrl: '/placeholder.jpg',
      saved: 10,
      days: [{ day: 1, location: 'Sample', activities: ['Activity'] }]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            <p className="text-gray-600">Your saved trips</p>
          </div>
        </div>

        {favoriteTrips.length === 0 ? (
          <div className="text-center py-12">
            <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No favorite trips</h3>
            <p className="mt-1 text-gray-500">Save trips to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={trip.imageUrl} 
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-xl font-semibold text-white">{trip.title}</h3>
                    <p className="text-gray-200 flex items-center">
                      <FiMapPin className="mr-1" size={14} />
                      {trip.location}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1" size={14} />
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiStar className="text-yellow-400 mr-1" size={14} />
                      {trip.saved}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}