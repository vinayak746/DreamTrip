'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Mocks for missing imports to make the component runnable ---
const useAuth = () => ({ user: { id: 'test_user', name: 'John Doe', email: 'john@doe.com', profilePicture: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }, loading: false });
const FiCalendar = (props: any) => <svg {...props}><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>;
const FiStar = (props: any) => <svg {...props}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const NewTripForm = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (trip: any) => void }) => (
  <div className="bg-white p-8 rounded-lg shadow-xl">
    <h2 className="text-2xl font-bold mb-4">Create a New Trip (Dummy Form)</h2>
    <button onClick={onClose} className="bg-gray-300 p-2 rounded">Close</button>
  </div>
);
// --- End Mocks ---

// --- Type Definitions (from your previous code) ---
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
}
// --- End Type Definitions ---


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // --- Initial state data ---
  const initialTrips: Trip[] = [
    {
      id: '1', title: 'Japan Adventure', location: 'Tokyo, Japan', startDate: '2024-11-15', endDate: '2024-11-25', type: 'adventure', imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', saved: 124, days: [{ day: 1, location: 'Tokyo', activities: ['Arrival', 'Shibuya Crossing'] }, { day: 2, location: 'Tokyo', activities: ['Meiji Shrine', 'Harajuku'] }]
    },
    {
      id: '2', title: 'Paris Getaway', location: 'Paris, France', startDate: '2024-10-05', endDate: '2024-10-10', type: 'leisure', imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', saved: 89, days: [{ day: 1, location: 'Paris', activities: ['Eiffel Tower', 'Seine River Cruise'] }, { day: 2, location: 'Paris', activities: ['Louvre Museum', 'Notre-Dame'] }]
    },
    {
      id: '3', title: 'Mountain Hiking', location: 'Swiss Alps, Switzerland', startDate: '2024-09-10', endDate: '2024-09-18', type: 'hiking', imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6de93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', saved: 45, days: [{ day: 1, location: 'Zermatt', activities: ['Arrival', 'Check-in'] }, { day: 2, location: 'Matterhorn', activities: ['Hike to Hörnli Hut'] }]
    }
  ];

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    trips: initialTrips,
    // Corrected: Initialize filteredTrips with all trips
    filteredTrips: initialTrips,
    showNewTripForm: false,
    userProfile: null,
    filters: {
      type: null,
      location: null
    }
  });

  // Corrected: Handler now only adds to the single source of truth (`trips`)
  const handleCreateTrip = (newTrip: Omit<Trip, 'id' | 'saved' | 'days'>) => {
    const newTripWithId = {
      ...newTrip,
      id: Date.now().toString(),
      saved: 0,
      days: [{ day: 1, location: newTrip.location, activities: [''] }]
    };

    setDashboardState(prev => {
      const updatedTrips = [newTripWithId, ...prev.trips];
      // After updating the main list, re-apply the filters to get the new filtered list
      const updatedFilteredTrips = updatedTrips.filter(trip => {
        if (prev.filters.type && trip.type !== prev.filters.type) return false;
        if (prev.filters.location && !trip.location.toLowerCase().includes(prev.filters.location.toLowerCase())) return false;
        return true;
      });

      return {
        ...prev,
        trips: updatedTrips,
        filteredTrips: updatedFilteredTrips,
        showNewTripForm: false // Also close the form
      };
    });
  };

  const handleFilterTrips = (type: TripType | null, location: string | null) => {
    setDashboardState(prev => {
      const updatedFilteredTrips = prev.trips.filter(trip => {
        if (type && trip.type !== type) return false;
        if (location && !trip.location.toLowerCase().includes(location.toLowerCase())) return false;
        return true;
      });

      return {
        ...prev,
        filters: { type, location },
        filteredTrips: updatedFilteredTrips
      };
    });
  };

  // Corrected: Handler now only modifies the single source of truth (`trips`)
  const handleToggleFavorite = (tripId: string) => {
    setDashboardState(prev => {
      const updatedTrips = prev.trips.map(trip => {
        if (trip.id === tripId) {
          return { ...trip, saved: trip.saved + 1 };
        }
        return trip;
      });

      // After updating the main list, re-apply the filters
      const updatedFilteredTrips = updatedTrips.filter(trip => {
        if (prev.filters.type && trip.type !== prev.filters.type) return false;
        if (prev.filters.location && !trip.location.toLowerCase().includes(prev.filters.location.toLowerCase())) return false;
        return true;
      });

      return {
        ...prev,
        trips: updatedTrips,
        filteredTrips: updatedFilteredTrips
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
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        }
      }));
    }
  }, [user, loading, router]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {dashboardState.userProfile && (
        <div className="fixed top-4 right-4 flex items-center space-x-3">
          <img src={dashboardState.userProfile.profilePicture} alt={dashboardState.userProfile.name} className="w-12 h-12 rounded-full" />
          <span className="text-sm font-medium text-gray-700">{dashboardState.userProfile.name}</span>
        </div>
      )}
      
      {/* Container for trip cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-16">
        {dashboardState.filteredTrips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{trip.title}</h3>
              <div className="flex items-center justify-between my-3 text-sm text-gray-500">
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
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium" onClick={() => handleToggleFavorite(trip.id)}>
                  Favorite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dashboardState.showNewTripForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NewTripForm onClose={() => setDashboardState(prev => ({ ...prev, showNewTripForm: false }))} onSubmit={handleCreateTrip} />
        </div>
      )}

      {/* Button to create a new trip */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg" 
          onClick={() => setDashboardState(prev => ({ ...prev, showNewTripForm: true }))}>
          Create New Trip
        </button>
      </div>
    </div>
  );
}