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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Trip, TripFormData } from '@/types/trip';

class TripService {
  // Get all trips for a user
  async getTrips(userId: string): Promise<Trip[]> {
    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const q = query(tripsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
    } catch (error) {
      console.error('Error getting trips:', error);
      throw error;
    }
  }

  // Get a single trip by ID
  async getTrip(userId: string, tripId: string): Promise<Trip | null> {
    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        return null;
      }
      
      return {
        id: tripSnap.id,
        ...tripSnap.data()
      } as Trip;
    } catch (error) {
      console.error('Error getting trip:', error);
      throw error;
    }
  }

  // Create a new trip
  async createTrip(userId: string, tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const newTripRef = doc(tripsRef);
      
      const tripWithTimestamps = {
        ...tripData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(newTripRef, tripWithTimestamps);
      
      return {
        id: newTripRef.id,
        ...tripWithTimestamps
      };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  // Update an existing trip
  async updateTrip(
    userId: string, 
    tripId: string, 
    updates: Partial<Trip>
  ): Promise<void> {
    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  // Delete a trip
  async deleteTrip(userId: string, tripId: string): Promise<void> {
    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, tripId: string, isFavorite: boolean): Promise<void> {
    try {
      await this.updateTrip(userId, tripId, { isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Search trips
  async searchTrips(userId: string, query: string): Promise<Trip[]> {
    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const q = query(
        tripsRef,
        where('title', '>=', query),
        where('title', '<=', query + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
    } catch (error) {
      console.error('Error searching trips:', error);
      throw error;
    }
  }
}

export const tripService = new TripService();
