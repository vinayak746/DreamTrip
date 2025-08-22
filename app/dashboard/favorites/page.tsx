'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHeart, FiMapPin, FiCalendar, FiStar, FiCompass, FiTrendingUp, FiClock } from 'react-icons/fi';
import { doc, getDoc, onSnapshot, updateDoc, arrayRemove, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { getFirestoreDb } from '@/firebase/config';

// Utility function to split array into chunks
function arrayChunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

import Image from 'next/image';

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
  saved?: number;
  days?: Array<{
    day: number;
    location: string;
    activities: string[];
  }>;
  userId: string;
}

const typeIcons = {
  leisure: <FiStar className="text-yellow-500" />,
  business: <FiTrendingUp className="text-blue-500" />,
  adventure: <FiCompass className="text-emerald-500" />,
  hiking: <FiMapPin className="text-red-500" />,
  family: <FiStar className="text-purple-500" />
};

const typeLabels = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  hiking: 'Hiking',
  family: 'Family'
};

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favoriteTrips, setFavoriteTrips] = useState<Trip[]>([]);
  const [favoriteTripIds, setFavoriteTripIds] = useState<Set<string>>(new Set());

  // Load user's favorite trips with real-time updates
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const db = getFirestoreDb();
    const userRef = doc(db, 'users', user.uid);
    
    // Set up real-time listener for user's favorites
    const unsubscribe = onSnapshot(userRef, async (userDoc: DocumentSnapshot<DocumentData>) => {
      try {
        setLoading(true);
        console.log('Favorites update received');
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Ensure we have an array and remove any duplicates
          const favorites = Array.isArray(userData.favoriteTrips) 
            ? [...new Set(userData.favoriteTrips)] 
            : [];
            
          console.log('Updated favorites from Firestore:', favorites);
          
          // Update the favorite trip IDs
          setFavoriteTripIds(new Set(favorites));

          if (favorites.length === 0) {
            console.log('No favorites found');
            setFavoriteTrips([]);
            setLoading(false);
            return;
          }

          // Get the actual trip data for each favorite using a transaction
          console.log('Fetching trip details for favorites...');
          const batch = arrayChunk(favorites, 10); // Process 10 at a time to avoid too many concurrent requests
          let allTrips: Trip[] = [];
          
          for (const chunk of batch) {
            const tripsPromises = chunk.map(async (tripId: string) => {
              try {
                // Look for the trip in the user's trips subcollection
                const tripRef = doc(db, 'users', user.uid, 'trips', tripId);
                const tripDoc = await getDoc(tripRef);
                
                if (tripDoc.exists()) {
                  const tripData = tripDoc.data() as Omit<Trip, 'id'>;
                  console.log(`Found trip: ${tripId} - ${tripData.title}`);
                  return { id: tripDoc.id, ...tripData };
                } else {
                  console.warn(`Trip not found in user's trips: ${tripId}, removing from favorites`);
                  // Remove non-existent trip from favorites
                  await updateDoc(userRef, {
                    favoriteTrips: arrayRemove(tripId)
                  });
                  return null;
                }
              } catch (error) {
                console.error(`Error fetching trip ${tripId}:`, error);
                return null;
              }
            });
            
            const chunkResults = await Promise.all(tripsPromises);
            allTrips = [...allTrips, ...chunkResults.filter(Boolean) as Trip[]];
          }
          
          console.log('Fetched trips:', allTrips);
          setFavoriteTrips(allTrips);
        } else {
          console.log('User document does not exist yet');
          setFavoriteTrips([]);
        }
      } catch (error) {
        console.error('Error in favorites listener:', error);
      } finally {
        setLoading(false);
      }
    }, (error: Error) => {
      console.error('Error setting up favorites listener:', error);
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => {
      console.log('Cleaning up favorites listener');
      unsubscribe();
    };
  }, [user?.uid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
            <FiHeart className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No favorite trips yet</h3>
            <p className="mt-2 text-gray-500">Save trips to see them here!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Trips
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTrips.map((trip) => {
              const startDate = new Date(trip.startDate);
              const endDate = new Date(trip.endDate);
              const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <div 
                  key={trip.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/trip/${trip.id}`)}
                >
                  <div className="relative h-48">
                    <Image 
                      src={trip.imageUrl || '/placeholder.jpg'} 
                      alt={trip.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <div className="p-2 rounded-full bg-white/80 text-red-500">
                        <FiHeart className="fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{trip.title}</h3>
                          <p className="text-gray-200 text-sm flex items-center">
                            <FiMapPin className="mr-1" size={14} />
                            {trip.location}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                          {typeLabels[trip.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-1.5" size={14} />
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-1.5" size={14} />
                        {days} {days === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                    {trip.saved !== undefined && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiHeart className="mr-1 text-red-500" size={14} />
                        {trip.saved} {trip.saved === 1 ? 'save' : 'saves'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}