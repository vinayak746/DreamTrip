'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiStar, FiPlus, FiMapPin } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const NewTripForm = dynamic(() => import('./components/NewTripForm'), { ssr: false });

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

interface TripDay {
  day: number;
  location: string;
  activities: string[];
}

interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  saved: number;
  days: TripDay[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface DashboardState {
  trips: Trip[];
  filteredTrips: Trip[];
  showNewTripForm: boolean;
  userProfile: UserProfile | null;
  filters: {
    type: TripType | null;
    location: string | null;
  };
  searchQuery: string;
  activeFilter: string;
}

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    trips: [
      {
        id: '1',
        title: 'Japan Adventure',
        location: 'Tokyo, Japan',
        startDate: '2024-11-15',
        endDate: '2024-11-25',
        type: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        saved: 124,
        days: [
          { day: 1, location: 'Tokyo', activities: ['Arrival', 'Shibuya Crossing'] },
          { day: 2, location: 'Tokyo', activities: ['Meiji Shrine', 'Harajuku'] }
        ]
      },
      {
        id: '2',
        title: 'Paris Getaway',
        location: 'Paris, France',
        startDate: '2024-10-05',
        endDate: '2024-10-10',
        type: 'leisure',
        imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        saved: 89,
        days: [
          { day: 1, location: 'Paris', activities: ['Eiffel Tower', 'Seine River Cruise'] },
          { day: 2, location: 'Paris', activities: ['Louvre Museum', 'Notre-Dame'] }
        ]
      },
      {
        id: '3',
        title: 'Mountain Hiking',
        location: 'Swiss Alps, Switzerland',
        startDate: '2024-09-10',
        endDate: '2024-09-18',
        type: 'hiking',
        imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6de93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        saved: 45,
        days: [
          { day: 1, location: 'Zermatt', activities: ['Arrival', 'Check-in'] },
          { day: 2, location: 'Matterhorn', activities: ['Hike to Hörnli Hut'] }
        ]
      }
    ],
    filteredTrips: [],
    showNewTripForm: false,
    userProfile: null,
    filters: {
      type: null,
      location: null
    },
    searchQuery: '',
    activeFilter: 'all'
  });

  const handleCreateTrip = (newTrip: Omit<Trip, 'id' | 'saved' | 'days'>) => {
    const trip: Trip = {
      ...newTrip,
      id: Date.now().toString(),
      saved: 0,
      days: [{ day: 1, location: newTrip.location, activities: [''] }]
    };
    
    setDashboardState((prev: DashboardState) => ({
      ...prev,
      trips: [trip, ...prev.trips],
      filteredTrips: [trip, ...prev.filteredTrips],
      showNewTripForm: false
    }));
  };

  const handleFilterTrips = (type: TripType | null, location: string | null) => {
    setDashboardState((prev: DashboardState) => ({
      ...prev,
      filters: { type, location },
      filteredTrips: prev.trips.filter(trip => {
        if (type && trip.type !== type) return false;
        if (location && !trip.location.toLowerCase().includes(location.toLowerCase())) return false;
        return true;
      })
    }));
  };

  const handleToggleFavorite = (tripId: string) => {
    setDashboardState((prev: DashboardState) => {
      const updatedTrips = prev.trips.map(trip => 
        trip.id === tripId ? { ...trip, saved: trip.saved + 1 } : trip
      );
      
      return {
        ...prev,
        trips: updatedTrips,
        filteredTrips: updatedTrips.filter(trip => 
          prev.filteredTrips.some(ft => ft.id === trip.id)
        )
      };
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      setDashboardState(prev => ({
        ...prev,
        userProfile: {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          profilePicture: user.photoURL || '/default-avatar.png'
        },
        filteredTrips: prev.trips // Initialize filtered trips with all trips
      }));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Trips</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDashboardState(prev => ({ ...prev, showNewTripForm: true }))}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              New Trip
            </button>
            {dashboardState.userProfile && (
              <div className="flex items-center space-x-2">
                <img
                  src={dashboardState.userProfile.profilePicture}
                  alt={dashboardState.userProfile.name}
                  className="w-10 h-10 rounded-full border-2 border-indigo-200"
                />
              </div>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by location..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleFilterTrips(dashboardState.filters.type, e.target.value || null)}
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'adventure', 'leisure', 'hiking', 'business', 'family'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterTrips(filter === 'all' ? null : filter as TripType, dashboardState.filters.location)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    (filter === 'all' && !dashboardState.filters.type) || dashboardState.filters.type === filter
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardState.filteredTrips.length > 0 ? (
            dashboardState.filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={trip.imageUrl} 
                    alt={trip.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{trip.location}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" size={14} />
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </div>
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" size={14} />
                      {trip.saved}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}
                    </span>
                    <button 
                      onClick={() => handleToggleFavorite(trip.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Favorite
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No trips found. Create a new trip to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* New Trip Modal */}
      {dashboardState.showNewTripForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NewTripForm 
            onClose={() => setDashboardState(prev => ({ ...prev, showNewTripForm: false }))} 
            onSubmit={handleCreateTrip} 
          />
        </div>
      )}
    </div>
  );
}
