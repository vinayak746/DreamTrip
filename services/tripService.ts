import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  increment,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { getFirestoreDb } from '@/firebase/config';
const db = getFirestoreDb();
import { Trip, TripFormData, TripType } from '@/types/trip';

type TripCreateData = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
type TripUpdateData = Partial<Omit<Trip, 'id' | 'createdAt' | 'userId'>> & {
  updatedAt?: any; // Allowing Firestore serverTimestamp
};

// Helper function to convert Firestore document to Trip
const mapDocumentToTrip = (doc: QueryDocumentSnapshot | DocumentSnapshot): Trip => {
  const data = doc.data();
  if (!data) throw new Error('Document data is undefined');
  
  // Handle both array and single string for imageUrl for backward compatibility
  const imageUrls = Array.isArray(data.imageUrls) 
    ? data.imageUrls 
    : data.imageUrl 
      ? [data.imageUrl] 
      : [];
  
  // Ensure imageUrl is always set (use first image from imageUrls if available)
  const imageUrl = imageUrls[0] || '';
  
  return {
    id: doc.id,
    title: data.title,
    description: data.description || '',
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    type: data.type || 'leisure', // Default to 'leisure' if not specified
    imageUrl, // For backward compatibility
    imageUrls,
    isFavorite: data.isFavorite || false,
    isPublic: data.isPublic || false,
    saved: data.saved || 0,
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    days: data.days || [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    coverImageIndex: typeof data.coverImageIndex === 'number' ? data.coverImageIndex : 0,
    budget: data.budget || undefined,
    collaborators: Array.isArray(data.collaborators) ? data.collaborators : []
  };
};

class TripService {
  /**
   * Get all trips for a user with optional filtering and sorting
   * @param userId - The ID of the user
   * @param filters - Optional filters to apply
   * @param sortField - Field to sort by (default: 'createdAt')
   * @param sortDirection - Sort direction (default: 'desc')
   * @returns Promise with array of trips
   */
  async getTrips(
    userId: string, 
    filters: {
      type?: TripType;
      isFavorite?: boolean;
      startDate?: Date;
      endDate?: Date;
    } = {},
    sortField: keyof Trip = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<Trip[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const queryConstraints: QueryConstraint[] = [];

      // Apply filters if provided
      if (filters.type) {
        queryConstraints.push(where('type', '==', filters.type));
      }
      if (filters.isFavorite !== undefined) {
        queryConstraints.push(where('isFavorite', '==', filters.isFavorite));
      }
      if (filters.startDate) {
        queryConstraints.push(where('startDate', '>=', filters.startDate));
      }
      if (filters.endDate) {
        queryConstraints.push(where('endDate', '<=', filters.endDate));
      }

      // Add sorting
      queryConstraints.push(orderBy(sortField, sortDirection));

      const q = query(tripsRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(mapDocumentToTrip);
    } catch (error) {
      console.error('Error getting trips:', error);
      throw new Error('Failed to fetch trips. Please try again later.');
    }
  }

  /**
   * Get a single trip by ID
   * @param userId - The ID of the user
   * @param tripId - The ID of the trip to retrieve
   * @returns Promise with the trip or null if not found
   */
  async getTrip(userId: string, tripId: string): Promise<Trip | null> {
    if (!userId || !tripId) {
      throw new Error('User ID and Trip ID are required');
    }

    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        return null;
      }
      
      return mapDocumentToTrip(tripSnap);
    } catch (error) {
      console.error('Error getting trip:', error);
      throw new Error('Failed to fetch trip. Please try again.');
    }
  }

  /**
   * Create a new trip
   * @param userId - The ID of the user creating the trip
   * @param tripData - The trip data to create
   * @returns Promise with the created trip including its ID
   */
  async createTrip(userId: string, tripData: TripCreateData): Promise<Trip> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!tripData.title || !tripData.location || !tripData.startDate || !tripData.endDate) {
      throw new Error('Missing required trip fields');
    }

    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const newTripRef = doc(tripsRef);
      
      // Create timestamps
      const now = new Date();
      
      // Create a clean trip data object with only the fields we want to store
      const tripToStore = {
        // Required fields
        title: tripData.title,
        description: tripData.description || '',
        location: tripData.location,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        type: tripData.type || 'leisure',
        
        // Image handling
        imageUrl: tripData.imageUrl || '', // For backward compatibility
        imageUrls: Array.isArray(tripData.imageUrls) 
          ? tripData.imageUrls.filter((url): url is string => typeof url === 'string')
          : [],
        coverImageIndex: typeof tripData.coverImageIndex === 'number' 
          ? tripData.coverImageIndex 
          : 0,
        
        // Trip organization
        days: Array.isArray(tripData.days) ? tripData.days : [],
        tags: Array.isArray(tripData.tags) ? tripData.tags : [],
        isPublic: Boolean(tripData.isPublic),
        
        // User and stats
        userId,
        isFavorite: Boolean(tripData.isFavorite),
        saved: typeof tripData.saved === 'number' ? tripData.saved : 0,
        
        // Optional fields
        budget: tripData.budget || undefined,
        collaborators: Array.isArray(tripData.collaborators) 
          ? tripData.collaborators 
          : [],
        
        // Timestamps
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      
      await setDoc(newTripRef, tripToStore);
      
      // Return the created trip with the correct types
      return {
        id: newTripRef.id,
        ...tripToStore
      };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error('Failed to create trip. Please try again.');
    }
  }

  /**
   * Update an existing trip
   * @param userId - The ID of the user who owns the trip
   * @param tripId - The ID of the trip to update
   * @param updates - The fields to update
   * @returns Promise that resolves when the update is complete
   */
  async updateTrip(
    userId: string, 
    tripId: string, 
    updates: TripUpdateData
  ): Promise<void> {
    if (!userId || !tripId) {
      throw new Error('User ID and Trip ID are required');
    }

    if (Object.keys(updates).length === 0) {
      console.warn('No updates provided');
      return;
    }

    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      
      // Don't allow updating these fields
      const { id, userId: _, createdAt, ...safeUpdates } = updates as any;
      
      // Clean and prepare the updates
      const cleanedUpdates: Record<string, any> = {};
      
      // Handle image updates
      if ('imageUrls' in safeUpdates) {
        cleanedUpdates.imageUrls = Array.isArray(safeUpdates.imageUrls)
          ? safeUpdates.imageUrls.filter((url: any): url is string => typeof url === 'string')
          : [];
          
        // Update the main imageUrl if it's not explicitly set and we have imageUrls
        if (!('imageUrl' in safeUpdates) && cleanedUpdates.imageUrls.length > 0) {
          cleanedUpdates.imageUrl = cleanedUpdates.imageUrls[0];
        }
      }
      
      // Handle cover image index
      if ('coverImageIndex' in safeUpdates) {
        const index = Number(safeUpdates.coverImageIndex) || 0;
        cleanedUpdates.coverImageIndex = Math.max(0, index);
      }
      
      // Handle arrays to ensure they're properly typed
      if ('tags' in safeUpdates) {
        cleanedUpdates.tags = Array.isArray(safeUpdates.tags) ? safeUpdates.tags : [];
      }
      
      if ('days' in safeUpdates) {
        cleanedUpdates.days = Array.isArray(safeUpdates.days) ? safeUpdates.days : [];
      }
      
      if ('collaborators' in safeUpdates) {
        cleanedUpdates.collaborators = Array.isArray(safeUpdates.collaborators) 
          ? safeUpdates.collaborators 
          : [];
      }
      
      // Handle booleans
      if ('isPublic' in safeUpdates) {
        cleanedUpdates.isPublic = Boolean(safeUpdates.isPublic);
      }
      
      if ('isFavorite' in safeUpdates) {
        cleanedUpdates.isFavorite = Boolean(safeUpdates.isFavorite);
      }
      
      // Handle numbers
      if ('saved' in safeUpdates) {
        const saved = Number(safeUpdates.saved);
        cleanedUpdates.saved = isNaN(saved) ? 0 : Math.max(0, saved);
      }
      
      // Add any other fields that don't need special handling
      Object.entries(safeUpdates).forEach(([key, value]) => {
        if (!(key in cleanedUpdates) && value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });
      
      // Add updatedAt timestamp
      cleanedUpdates.updatedAt = serverTimestamp();
      
      // Perform the update
      await updateDoc(tripRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error('Failed to update trip. Please try again.');
    }
  }

  /**
   * Delete a trip
   * @param userId - The ID of the user who owns the trip
   * @param tripId - The ID of the trip to delete
   * @returns Promise that resolves when the trip is deleted
   */
  async deleteTrip(userId: string, tripId: string): Promise<void> {
    if (!userId || !tripId) {
      throw new Error('User ID and Trip ID are required');
    }

    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error('Failed to delete trip. Please try again.');
    }
  }

  /**
   * Toggle the favorite status of a trip
   * @param userId - The ID of the user who owns the trip
   * @param tripId - The ID of the trip to update
   * @param isFavorite - The new favorite status
   * @returns Promise that resolves when the update is complete
   */
  async toggleFavorite(userId: string, tripId: string, isFavorite: boolean): Promise<void> {
    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      await updateDoc(tripRef, {
        isFavorite: Boolean(isFavorite),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to update favorite status. Please try again.');
    }
  }

  /**
   * Search trips by title or location
   * @param userId - The ID of the user
   * @param searchTerm - The search term to look for in title or location
   * @param limit - Maximum number of results to return (default: 10)
   * @returns Promise with array of matching trips
   */
  async searchTrips(userId: string, searchTerm: string, resultLimit: number = 10): Promise<Trip[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const searchLower = searchTerm.toLowerCase();
      
      // Search in title (case-insensitive)
      const titleQuery = query(
        tripsRef,
        where('searchTerms', 'array-contains', searchLower),
        orderBy('createdAt', 'desc'),
        limit(resultLimit)
      );
      
      const titleSnapshot = await getDocs(titleQuery);
      
      // If we have enough results, return them
      if (titleSnapshot.size >= resultLimit) {
        return titleSnapshot.docs.map(mapDocumentToTrip);
      }
      
      // If not, also search in location
      const locationQuery = query(
        tripsRef,
        where('locationSearch', '>=', searchLower),
        where('locationSearch', '<=', searchLower + '\uf8ff'),
        orderBy('locationSearch'),
        limit(resultLimit - titleSnapshot.size)
      );
      
      const locationSnapshot = await getDocs(locationQuery);
      
      // Combine and deduplicate results
      const results = new Map<string, Trip>();
      
      titleSnapshot.docs.forEach(doc => {
        const trip = mapDocumentToTrip(doc);
        results.set(trip.id, trip);
      });
      
      locationSnapshot.docs.forEach(doc => {
        if (!results.has(doc.id)) {
          const trip = mapDocumentToTrip(doc);
          results.set(trip.id, trip);
        }
      });
      
      return Array.from(results.values());
    } catch (error) {
      console.error('Error searching trips:', error);
      throw new Error('Failed to search trips. Please try again.');
    }
  }
  
  /**
   * Increment the saved count of a trip
   * @param userId - The ID of the user who owns the trip
   * @param tripId - The ID of the trip to update
   * @returns Promise with the new saved count
   */
  async incrementSavedCount(userId: string, tripId: string): Promise<number> {
    if (!userId || !tripId) {
      throw new Error('User ID and Trip ID are required');
    }

    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      await updateDoc(tripRef, {
        saved: increment(1),
        updatedAt: serverTimestamp()
      });

      // Get the updated count
      const tripSnap = await getDoc(tripRef);
      return tripSnap.data()?.saved || 0;
    } catch (error) {
      console.error('Error incrementing saved count:', error);
      throw new Error('Failed to update saved count. Please try again.');
    }
  }
}

export const tripService = new TripService();
