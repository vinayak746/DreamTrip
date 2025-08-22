'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestoreDb, tripService } from '@/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp, type Timestamp as FirebaseTimestamp, collection } from 'firebase/firestore';
import { 
  FiPlus, FiSearch, FiStar, FiMoreVertical, FiX, 
  FiEdit2, FiTrash2, FiHeart, FiChevronDown, 
  FiMapPin, FiCalendar, FiUser, FiLogOut, FiXCircle 
} from 'react-icons/fi';
import NewTripForm from './components/NewTripForm';
import EditTripForm from './components/EditTripForm';
import { Trip, TripType, TripFormData, TripDay } from '@/types/trip';
import TripCard from './components/TripCard';
import { getTripImage } from '@/utils/tripImages';

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
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [showTripActions, setShowTripActions] = useState<string | null>(null);
  const [favoriteTrips, setFavoriteTrips] = useState<Set<string>>(new Set());
  
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

  // Fetch user's favorite trips
  const fetchFavoriteTrips = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const db = getFirestoreDb();
      const userRef = doc(db, 'users', user.uid);
      
      // First try to get the user document
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create the user document with default values if it doesn't exist
        await setDoc(userRef, {
          favoriteTrips: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setFavoriteTrips(new Set());
        return;
      }
      
      // If document exists, get the favoriteTrips array
      const userData = userDoc.data();
      if (userData && Array.isArray(userData.favoriteTrips)) {
        setFavoriteTrips(new Set(userData.favoriteTrips));
      } else {
        // If favoriteTrips doesn't exist or isn't an array, initialize it
        await updateDoc(userRef, {
          favoriteTrips: [],
          updatedAt: serverTimestamp()
        });
        setFavoriteTrips(new Set());
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Initialize with empty set in case of error
      setFavoriteTrips(new Set());
    }
  }, [user?.uid]);

  // Toggle trip favorite status
  const handleToggleFavorite = async (tripId: string, isFavorite: boolean) => {
    console.log(`Toggling favorite for trip ${tripId}, isFavorite: ${isFavorite}`);
    if (!user?.uid) {
      console.log('No user ID found');
      return false;
    }
    
    try {
      const db = getFirestoreDb();
      const userRef = doc(db, 'users', user.uid);
      const userTripsRef = collection(db, 'users', user.uid, 'trips');
      const tripRef = doc(userTripsRef, tripId);
      
      // First verify the trip exists in the user's trips
      const tripDoc = await getDoc(tripRef);
      if (!tripDoc.exists()) {
        console.error(`Trip ${tripId} not found in user's trips`);
        return false;
      }
  
      // Get current favorites
      const userDoc = await getDoc(userRef);
      const currentFavorites = userDoc.exists() ? (userDoc.data()?.favoriteTrips || []) : [];
      
      // Update local state optimistically
      const newFavorites = isFavorite 
        ? [...currentFavorites, tripId]
        : currentFavorites.filter((id: string) => id !== tripId);
      
      // Update Firestore
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          favoriteTrips: newFavorites,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(userRef, {
          favoriteTrips: newFavorites,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update the trip's isFavorite field
      await updateDoc(tripRef, {
        isFavorite,
        updatedAt: serverTimestamp()
      });
      
      console.log('Favorite update successful');
      return true;
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert local state on error
      setFavoriteTrips(new Set(favoriteTrips));
      throw error;
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

  // Handle trip update with image handling
  const handleUpdateTrip = async (tripId: string, formData: ExtendedTripFormData) => {
    try {
      updateDashboardState({ loading: true });
      
      let imageUrl = '';
      
      // Handle new image upload if provided
      if (formData.imageFile) {
        // Delete old image if it exists and is not the default image
        const oldTrip = dashboardState.trips.find(t => t.id === tripId);
        if (oldTrip?.imageUrl && !oldTrip.imageUrl.includes('default-trip')) {
          try {
            const storage = getStorage();
            const oldImageRef = ref(storage, oldTrip.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn('Error deleting old image:', error);
          }
        }
        
        // Upload new image
        imageUrl = await uploadTripImage(formData.imageFile, tripId);
      }
      
      // Prepare trip data for update
      const tripUpdates = {
        ...formData,
        imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(tripUpdates).forEach(key => 
        tripUpdates[key as keyof typeof tripUpdates] === undefined && 
        delete tripUpdates[key as keyof typeof tripUpdates]
      );
      
      // Update trip in Firestore
      await tripService.updateTrip(user?.uid || '', tripId, tripUpdates);
      
      // Refresh trips list
      await fetchTrips();
      
      // Reset edit state
      setTripToEdit(null);
      
      updateDashboardState({ 
        loading: false,
        showNewTripForm: false
      });
      
      return true;
    } catch (error) {
      console.error('Error updating trip:', error);
      updateDashboardState({ 
        loading: false,
        error: 'Failed to update trip. Please try again.'
      });
      return false;
    }
  };

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return false;
    }
    
    try {
      updateDashboardState({ loading: true });
      
      // Delete trip from Firestore
      await tripService.deleteTrip(user?.uid || '', tripId);
      
      // Refresh trips list
      await fetchTrips();
      
      // Reset edit state if needed
      if (tripToEdit?.id === tripId) {
        setTripToEdit(null);
      }
      
      updateDashboardState({ loading: false });
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      updateDashboardState({ 
        loading: false,
        error: 'Failed to delete trip. Please try again.'
      });
      return false;
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

  // Render loading state
  if (dashboardState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle trip edit
  const handleEditTrip = (trip: Trip) => {
    setTripToEdit(trip);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Trips</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setTripToEdit(null);
                updateDashboardState({ showNewTripForm: true });
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* Edit Trip Form Modal */}
        {tripToEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit Trip</h2>
                  <button 
                    onClick={() => setTripToEdit(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <EditTripForm
                  initialData={tripToEdit}
                  onSubmit={async (data) => {
                    const success = await handleUpdateTrip(tripToEdit.id, data);
                    if (success) {
                      setTripToEdit(null);
                    }
                  }}
                  onCancel={() => setTripToEdit(null)}
                  onDelete={() => handleDeleteTrip(tripToEdit.id)}
                />
              </div>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={trip.title}
                location={trip.location}
                startDate={trip.startDate}
                endDate={trip.endDate}
                description={trip.description}
                imageUrl={trip.imageUrl || getTripImage(trip.type)}
                type={trip.type}
                saved={trip.saved || 0}
                userId={trip.userId}
                isFavorite={favoriteTrips.has(trip.id)}
                onFavoriteToggle={handleToggleFavorite}
                onEdit={handleEditTrip}
                onViewDetails={() => setSelectedTrip(trip)}
              />
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
