'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPlus, FiMapPin, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import TripCard from './components/TripCard';
import NewTripModal from './components/NewTripModal';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/firebase/config';

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';
type FilterType = 'all' | TripType;

interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  type: TripType;
  days?: Array<{
    day: number;
    location: string;
    activities: string[];
  }>;
  saved?: number;
}

export default function DashboardContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user's favorite trips
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(getFirestoreDb(), 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFavorites(new Set(userData.favoriteTrips || []));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user?.uid]);

  const handleFavoriteToggle = async (tripId: string, isFavorite: boolean): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      const userRef = doc(getFirestoreDb(), 'users', user.uid);
      
      if (isFavorite) {
        await updateDoc(userRef, {
          favoriteTrips: arrayUnion(tripId)
        });
        setFavorites(prev => new Set(prev).add(tripId));
      } else {
        await updateDoc(userRef, {
          favoriteTrips: arrayRemove(tripId)
        });
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(tripId);
          return newFavorites;
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating favorites:', error);
      return false;
    }
  };
  
  // Mock data - will be replaced with Firestore data
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      title: '10-Day Japan Adventure',
      location: 'Tokyo, Kyoto, Osaka',
      startDate: '2024-11-15',
      endDate: '2024-11-25',
      type: 'adventure',
      imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      saved: 124,
      days: [
        { day: 1, location: 'Tokyo', activities: ['Shibuya Crossing', 'Ramen tasting'] },
        { day: 2, location: 'Tokyo', activities: ['Ghibli Museum', 'Ueno Park'] },
        { day: 3, location: 'Kyoto', activities: ['Fushimi Inari Shrine'] },
      ]
    },
    {
      id: '2',
      title: 'Parisian Getaway',
      location: 'Paris, France',
      startDate: '2024-10-05',
      endDate: '2024-10-10',
      type: 'leisure',
      imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      saved: 210,
      days: [
        { day: 1, location: 'Paris', activities: ['Eiffel Tower', 'Seine River Cruise'] },
        { day: 2, location: 'Paris', activities: ['Louvre Museum', 'Notre-Dame'] },
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
      saved: 87,
      days: [
        { day: 1, location: 'Zermatt', activities: ['Arrival', 'Acclimatization'] },
        { day: 2, location: 'Matterhorn', activities: ['Hike to Hörnli Hut'] },
      ]
    }
  ]);

  const handleViewDetails = (tripId: string) => {
    router.push(`/dashboard/trips/${tripId}`);
  };

  const handleCreateNewTrip = (tripData: {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    type: TripType;
  }) => {
    // In a real app, this would save to Firestore
    const newTrip: Trip = {
      id: Date.now().toString(),
      ...tripData,
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    };
    setTrips([newTrip, ...trips]);
  };

  // Filter trips based on search query and active filter
  const filteredTrips = trips.filter(trip => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         trip.title.toLowerCase().includes(searchLower) ||
                         trip.location.toLowerCase().includes(searchLower);
    const matchesFilter = activeFilter === 'all' || trip.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Get favorite trips
  const favoriteTrips = filteredTrips.filter(trip => favorites.has(trip.id));
  
  const tripTypes: TripType[] = ['leisure', 'business', 'adventure', 'hiking', 'family'];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* New Trip Modal */}
      <NewTripModal
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onSubmit={handleCreateNewTrip}
      />

      {/* Header with Search */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 pb-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">DreamTrip</h1>
            <button
              onClick={() => setShowNewTripModal(true)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow-md hover:shadow-lg"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Trip
            </button>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto pb-8 px-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search destinations or activities..."
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      activeFilter === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Trips
                  </button>
                  {tripTypes.map((tripType) => (
                    <button
                      key={tripType}
                      onClick={() => setActiveFilter(tripType)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center ${
                        activeFilter === tripType
                          ? `${{
                              leisure: 'bg-amber-100 text-amber-800',
                              business: 'bg-blue-100 text-blue-800',
                              adventure: 'bg-emerald-100 text-emerald-800',
                              hiking: 'bg-red-100 text-red-800',
                              family: 'bg-purple-100 text-purple-800'
                            }[tripType]}` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1.5">
                        {{
                          leisure: '',
                          business: '',
                          adventure: '',
                          hiking: '',
                          family: ''
                        }[tripType]}
                      </span>
                      {tripType.charAt(0).toUpperCase() + tripType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {/* Trip Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeFilter === 'all' ? 'All Trips' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Trips`}
              {searchQuery && ` matching "${searchQuery}"`}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} found
            </span>
          </div>
          
          {filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <FiMapPin className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery || activeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first trip to get started!'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowNewTripModal(true)}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Trip
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  location={trip.location}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  imageUrl={trip.imageUrl}
                  type={trip.type}
                  saved={trip.saved}
                  description={trip.days?.map(day => day.activities[0]).join(' • ')}
                  userId={user.uid}
                  onViewDetails={handleViewDetails}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.has(trip.id)}
                  onEdit={(tripData) => {
                    // Handle edit
                    const updatedTrips = trips.map(t => 
                      t.id === tripData.id ? { ...t, ...tripData } : t
                    );
                    setTrips(updatedTrips);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
