'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, FiSearch, FiFilter, FiStar, FiMoreVertical, FiX, 
  FiEdit2, FiTrash2, FiUser, FiLogOut, FiHeart, FiChevronDown, 
  FiMapPin, FiCalendar 
} from 'react-icons/fi';
import NewTripForm from './components/NewTripForm';
import { Trip, TripDay, TripType, TripFormData } from '@/types/trip';
import { tripService } from '@/firebase/config';

// Extend the Trip interface to include Firestore fields
interface FirestoreTrip extends Omit<TripType, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
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
  loading: boolean;
  error: string | null;
}

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [showTripActions, setShowTripActions] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    trips: [],
    filteredTrips: [],
    showNewTripForm: false,
    userProfile: null,
    filters: {
      type: null,
      location: null
    },
    searchQuery: '',
    activeFilter: 'all',
    loading: true,
    error: null
  });

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleCreateTrip = async (formData: TripFormData) => {
    if (!user) {
      setDashboardState(prev => ({
        ...prev,
        error: 'You must be logged in to create a trip.'
      }));
      return;
    }
    
    try {
      setDashboardState(prev => ({ ...prev, loading: true }));
      
      // Create the trip data with required fields
      const tripData = {
        ...formData,
        saved: 0,
        isFavorite: false,
        days: [{ 
          day: 1, 
          location: formData.location, 
          activities: [''] 
        }],
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        userId: user.uid // Ensure the user ID is included
      };
      
      // Create the trip in Firestore
      const createdTrip = await tripService.createTrip(user.uid, tripData);
      
      // Format the created trip with proper timestamps
      const now = new Date().toISOString();
      const formattedTrip: Trip = {
        ...tripData,
        id: createdTrip.id,
        createdAt: now,
        updatedAt: now
      };
      
      // Update the UI state
      setDashboardState(prev => {
        const updatedTrips = [formattedTrip, ...prev.trips];
        return {
          ...prev,
          trips: updatedTrips,
          filteredTrips: updatedTrips, // Update filtered trips to include the new one
          showNewTripForm: false,
          loading: false,
          error: null
        };
      });
      
      return formattedTrip;
      
    } catch (error) {
      console.error('Error creating trip:', error);
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create trip. Please try again.'
      }));
      throw error; // Re-throw to allow form to handle the error
    }
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

  const deleteTrip = async (tripId: string) => {
    if (!user) return;
    
    try {
      await tripService.deleteTrip(user.uid, tripId);
      
      setDashboardState(prev => ({
        ...prev,
        trips: prev.trips.filter(trip => trip.id !== tripId),
        filteredTrips: prev.filteredTrips.filter(trip => trip.id !== tripId),
        error: null
      }));
    } catch (error) {
      console.error('Error deleting trip:', error);
      setDashboardState(prev => ({
        ...prev,
        error: 'Failed to delete trip. Please try again.'
      }));
    }
  };

  const toggleFavorite = async (tripId: string) => {
    if (!user) {
      setDashboardState(prev => ({
        ...prev,
        error: 'You must be logged in to favorite trips.'
      }));
      return;
    }
    
    try {
      const trip = dashboardState.trips.find(t => t.id === tripId);
      if (!trip) {
        console.error('Trip not found:', tripId);
        return;
      }
      
      const newFavoriteStatus = !trip.isFavorite;
      
      // Optimistic UI update
      setDashboardState(prev => {
        const updatedTrips = prev.trips.map(t => 
          t.id === tripId 
            ? { ...t, isFavorite: newFavoriteStatus, updatedAt: new Date().toISOString() } 
            : t
        );
        
        return {
          ...prev,
          trips: updatedTrips,
          filteredTrips: updatedTrips.filter(trip => {
            const searchQuery = prev.searchQuery.toLowerCase();
            const matchesSearch = 
              trip.title.toLowerCase().includes(searchQuery) ||
              trip.location.toLowerCase().includes(searchQuery);
            
            const matchesFilter = 
              (prev.filters.type === null || trip.type === prev.filters.type) &&
              (prev.filters.location === null || 
               trip.location.toLowerCase().includes(prev.filters.location.toLowerCase()));
            
            return matchesSearch && matchesFilter;
          }),
          error: null
        };
      });
      
      // Update in Firestore
      await tripService.updateTrip(user.uid, tripId, { 
        isFavorite: newFavoriteStatus,
        updatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating favorite status:', error);
      
      // Revert optimistic update on error
      setDashboardState(prev => {
        const originalTrips = prev.trips.map(t => 
          t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t
        );
        
        return {
          ...prev,
          trips: originalTrips,
          filteredTrips: originalTrips,
          error: 'Failed to update favorite status. Please try again.'
        };
      });
      
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  // Fetch trips from Firestore
  const fetchTrips = useCallback(async () => {
    if (!user) {
      console.error('No authenticated user');
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: 'Authentication required. Please sign in.'
      }));
      return;
    }
    
    try {
      setDashboardState(prev => ({ ...prev, loading: true }));
      console.log('Fetching trips for user:', user.uid);
      
      const trips = await tripService.getTrips(user.uid);
      
      // Convert Firestore trip data to Trip interface
      const formattedTrips = trips.map(trip => {
        // Handle Firestore timestamps
        const convertTimestamp = (timestamp: any) => {
          if (!timestamp) return new Date().toISOString();
          if (timestamp.toDate) return timestamp.toDate().toISOString();
          if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
          return new Date(timestamp).toISOString();
        };
        
        return {
          id: trip.id,
          title: trip.title || 'Untitled Trip',
          description: trip.description || '',
          location: trip.location || 'Unknown Location',
          startDate: trip.startDate || new Date().toISOString(),
          endDate: trip.endDate || new Date().toISOString(),
          type: (trip.type || 'leisure') as TripType,
          imageUrl: trip.imageUrl || '',
          saved: typeof trip.saved === 'number' ? trip.saved : 0,
          days: Array.isArray(trip.days) ? trip.days : [],
          isFavorite: Boolean(trip.isFavorite),
          createdAt: convertTimestamp(trip.createdAt),
          updatedAt: convertTimestamp(trip.updatedAt || trip.createdAt)
        } as Trip;
      });
      
      // Sort trips by creation date (newest first)
      const sortedTrips = [...formattedTrips].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setDashboardState(prev => ({
        ...prev,
        trips: sortedTrips,
        filteredTrips: sortedTrips,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching trips:', error);
      setDashboardState(prev => ({
        ...prev,
        error: 'Failed to load trips',
        loading: false
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      const handleFilterClick = (filter: string) => {
        setDashboardState(prev => ({
          ...prev,
          activeFilter: filter,
          filters: {
            ...prev.filters,
            type: filter === 'all' ? null : filter as 'leisure' | 'business' | 'adventure' | 'family'
          }
        }));
      };

      // Set user profile
      setDashboardState(prev => ({
        ...prev,
        userProfile: {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          profilePicture: user.photoURL || '/default-avatar.png'
        }
      }));
      
      // Fetch trips
      fetchTrips();
    }
  }, [user, authLoading, router, fetchTrips]);

  if (authLoading || dashboardState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  <img
                    src={dashboardState.userProfile.profilePicture || '/default-avatar.png'}
                    alt={dashboardState.userProfile.name}
                    className="w-10 h-10 rounded-full border-2 border-indigo-200 hover:border-indigo-300 transition-colors object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.png';
                    }}
                  />
                  <FiChevronDown className={`text-gray-500 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{dashboardState.userProfile.name}</p>
                      <p className="text-xs text-gray-500 truncate">{dashboardState.userProfile.email}</p>
                    </div>
                    <div className="py-1">
                      <a
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiUser className="mr-3" size={16} />
                        Profile
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FiLogOut className="mr-3" size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
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
                  onClick={() => handleFilterTrips(filter === 'all' ? null : filter as unknown as TripType, dashboardState.filters.location)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                      dashboardState.filters.type === (filter === 'all' ? null : filter as unknown as TripType)
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
                    src={trip.imageUrl

                      || ""
                    } 
                    alt={trip.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{trip.location}</p>
                  {trip.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  
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
                      onClick={() => toggleFavorite(trip.id)}
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
