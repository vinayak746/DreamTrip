'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { tripService } from '@/firebase/config';
// Import storage functions directly from Firebase
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore';
import { 
  FiPlus, FiSearch, FiStar, FiMoreVertical, FiX, 
  FiEdit2, FiTrash2, FiHeart, FiChevronDown, 
  FiMapPin, FiCalendar, FiUser, FiLogOut 
} from 'react-icons/fi';
import NewTripForm from './components/NewTripForm';
import { Trip, TripType, TripFormData, TripDay } from '@/types/trip';

// Define a type for Firestore timestamp
type FirestoreTimestamp = FirebaseTimestamp | { toDate: () => Date } | { seconds: number };

// Create a base trip type without the fields we want to modify
type BaseTrip = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'days'>;

// Extend the base trip type with Firestore-specific fields
interface FirestoreTrip extends BaseTrip {
  id: string;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
  days?: TripDay[];
}

// Helper function to convert Firestore timestamps to ISO strings
const convertTimestamp = (timestamp: any): string => {
  try {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
    return '';
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return '';
  }
};

// Extend TripFormData to include imageFile
interface ExtendedTripFormData extends TripFormData {
  imageFile?: File;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface DashboardState {
  trips: Trip[];
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

// Define the Dashboard component
export default function Dashboard() {
  // Hooks
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  // Refs
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Component state
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripActions, setShowTripActions] = useState<string | null>(null);
  
  // Initialize dashboard state with proper typing
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    trips: [],
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
  
  // Helper function to safely update dashboard state
  const updateDashboardState = useCallback((updates: Partial<DashboardState>) => {
    setDashboardState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

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

  // Initialize dashboard state with proper typing
 

  // Filter and memoize trips based on search query and active filter
  const filteredTrips = useMemo<Trip[]>(() => {
    const { trips, searchQuery, activeFilter } = dashboardState;
    if (!trips) return [];
    
    return trips.filter((trip: Trip) => {
      const matchesSearch = !searchQuery || 
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || trip.type === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [dashboardState.trips, dashboardState.searchQuery, dashboardState.activeFilter]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Upload image to Firebase Storage if a file is provided
  const uploadTripImage = async (file: File, tripId: string): Promise<string> => {
    if (!file) return '';
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `trip-images/${tripId}/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      return '';
    }
  };

  // Handle trip creation with image upload
  const handleCreateTrip = async (formData: ExtendedTripFormData) => {
    try {
      updateDashboardState({ loading: true });
      
      // Upload image if provided
      let imageUrl = '';
      if (formData.imageFile) {
        imageUrl = await uploadTripImage(formData.imageFile, 'new-trip');
      }

      // Create trip with image URL
      const newTripData = {
        ...formData,
        imageUrl,
        isFavorite: false,
        saved: 0,
        days: [],
        userId: user?.uid || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save trip to Firestore
      const createdTrip = await tripService.createTrip(user?.uid || '', newTripData);
      
      // Refresh trips list
      await fetchTrips();
      
      // Update UI state
      updateDashboardState({
        showNewTripForm: false,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error creating trip:', error);
      updateDashboardState({
        loading: false,
        error: 'Failed to create trip. Please try again.'
      });
    }
  };

  const handleFilterTrips = (type: TripType | string | null, location: string | null) => {
    // If type is a string, convert it to TripType or null
    const filterType = type === 'all' || type === null ? null : type as TripType;
    
    setDashboardState(prev => ({
      ...prev,
      filters: { 
        type: filterType,
        location: location || null 
      },
      // Update search query if location is provided
      searchQuery: location || prev.searchQuery
    }));
  };

  const deleteTrip = async (tripId: string) => {
    if (!user) return;
    
    try {
      await tripService.deleteTrip(user.uid, tripId);
      
      setDashboardState(prev => ({
        ...prev,
        trips: prev.trips.filter(trip => trip.id !== tripId),
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
      const trip = dashboardState.trips.find((t: Trip) => t.id === tripId);
      if (!trip) {
        console.error('Trip not found:', tripId);
        return;
      }
      
      const newFavoriteStatus = !trip.isFavorite;
      
      // Optimistic UI update
      setDashboardState(prev => ({
        ...prev,
        trips: prev.trips.map((t: Trip) => 
          t.id === tripId 
            ? { ...t, isFavorite: newFavoriteStatus, updatedAt: new Date().toISOString() } 
            : t
        ),
        error: null
      }));
      
      // Update in Firestore
      await tripService.updateTrip(user.uid, tripId, { 
        isFavorite: newFavoriteStatus,
        updatedAt: new Date().toISOString()
      });
      
    } catch (error: unknown) {
      console.error('Error updating favorite status:', error);
      
      // Revert optimistic update on error
      setDashboardState(prev => ({
        ...prev,
        trips: prev.trips.map((t: Trip) => 
          t.id === tripId 
            ? { ...t, isFavorite: !t.isFavorite, updatedAt: new Date().toISOString() } 
            : t
        ),
        error: 'Failed to update favorite status. Please try again.'
      }));
      
      // Re-throw the error to allow the UI to handle it if needed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
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
      setDashboardState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch trips from Firestore
      const trips = await tripService.getTrips(user.uid);
      
      // Ensure all trips have required fields with proper typing
      const formattedTrips: Trip[] = trips.map(trip => {
        // Create a properly typed trip object
        const tripData: Omit<Trip, 'id'> = {
          title: trip.title || 'Untitled Trip',
          description: trip.description || '',
          location: trip.location || '',
          startDate: trip.startDate || '',
          endDate: trip.endDate || '',
          type: trip.type || 'leisure',
          isFavorite: trip.isFavorite || false,
          saved: trip.saved || 0,
          imageUrl: trip.imageUrl || '',
          userId: trip.userId || user!.uid, // We know user is defined here
          days: Array.isArray(trip.days) ? trip.days : [],
          createdAt: typeof trip.createdAt === 'string' ? trip.createdAt : new Date().toISOString(),
          updatedAt: typeof trip.updatedAt === 'string' ? trip.updatedAt : new Date().toISOString()
        };
        
        return {
          ...tripData,
          id: trip.id // Add the id separately to satisfy the Trip interface
        } as Trip;
      });
      
      // Sort trips by creation date (newest first)
      const sortedTrips = [...formattedTrips].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Update user profile and trips in state
      setDashboardState(prev => ({
        ...prev,
        trips: sortedTrips,
        userProfile: {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          profilePicture: user.photoURL || '/default-avatar.png'
        },
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching trips:', error);
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load trips. Please try again.'
      }));
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while fetching trips');
    }
  }, [user]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      router.push('/');
    }
  }, [user, fetchTrips, router]);

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
              {['all', 'adventure', 'leisure', 'hiking', 'business', 'family'].map((filter) => {
                // Safely cast to TripType if not 'all'
                const tripType = filter === 'all' ? null : filter as TripType;
                const isActive = dashboardState.filters.type === tripType;
                
                return (
                  <button
                    key={filter}
                    onClick={() => handleFilterTrips(tripType, dashboardState.filters.location)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={trip.imageUrl || ""}
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
