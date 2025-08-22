'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiHeart, FiMapPin, FiCalendar, FiStar, FiCompass, FiTrendingUp, FiClock } from 'react-icons/fi';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <FiHeart className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-indigo-50 rounded-full transition-colors duration-200 text-indigo-600 hover:text-indigo-700"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Favorites</h1>
            <p className="text-gray-500 mt-1">Your saved dream trips</p>
          </div>
        </div>

        {favoriteTrips.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-8 max-w-2xl mx-auto border border-gray-100">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative flex items-center justify-center w-full h-full">
                <FiHeart className="h-16 w-16 text-indigo-500" strokeWidth="1.5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Save your favorite trips to plan your next adventure</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Browse Trips
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteTrips.map((trip) => (
              <div 
                key={trip.id} 
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-50 flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <Image
                    src={trip.imageUrl}
                    alt={trip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleRemoveFavorite(trip.id);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 hover:bg-red-50 hover:scale-110 transition-all duration-200 shadow-sm"
                        aria-label="Remove from favorites"
                      >
                        <FiHeart className="h-5 w-5 fill-current" strokeWidth="1.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white line-clamp-1">{trip.title}</h3>
                      <div className="flex items-center mt-1 text-white/90">
                        <FiMapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="text-sm truncate">{trip.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-full">
                      <span className="text-indigo-600 text-sm font-medium">
                        {typeIcons[trip.type]}
                        <span className="ml-1.5">{typeLabels[trip.type]}</span>
                      </span>
                    </div>
                    {trip.saved && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {trip.saved} {trip.saved === 1 ? 'save' : 'saves'}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                      className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200 flex items-center justify-center group-hover:shadow-sm"
                    >
                      <span>View Details</span>
                      <FiArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-200" />
                    </button>
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