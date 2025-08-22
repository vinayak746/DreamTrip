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

  const handleFavoriteToggle = async (tripId: string, isFavorite: boolean) => {
    if (!user?.uid) return;
    
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
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw error;
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
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || trip.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Get favorite trips
  const favoriteTrips = trips.filter(trip => favorites.has(trip.id));

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Trip Modal */}
      <NewTripModal
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onSubmit={handleCreateNewTrip}
      />

      {/* Header with Search */}
      <div className="bg-indigo-600 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-white">DreamTrip</h1>
            <button
              onClick={() => setShowNewTripModal(true)}
              className="inline-flex items-center px-4 py-2.5 border-2 border-white text-sm font-medium rounded-lg shadow-sm text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Trip
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Filter Chips */}
        <div className="mb-8 flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeFilter === 'all' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Trips
          </button>
          <button
            onClick={() => router.push('/dashboard/favorites')}
            className="px-4 py-2 rounded-full text-sm font-medium bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors flex items-center"
          >
            <FiHeart className="mr-1.5" />
            Favorites ({favoriteTrips.length})
          </button>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm p-8">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
              <FiMapPin className="h-full w-full mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching trips found' : 'No trips yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'We couldn\'t find any trips matching your search. Try adjusting your filters.'
                : 'Plan your next adventure by creating a new trip.'}
            </p>
            <div>
              <button
                onClick={() => setShowNewTripModal(true)}
                className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FiPlus className="mr-2 h-5 w-5" />
                Create New Trip
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map(trip => (
            <TripCard
              key={trip.id}
              {...trip}
              isFavorite={favorites.has(trip.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onViewDetails={(id) => router.push(`/dashboard/trips/${id}`)}
            />
          ))}
          </div>
        )}
      </main>
    </div>
  );
}
