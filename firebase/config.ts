import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  User,
  Auth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc, Timestamp, DocumentData, QueryDocumentSnapshot, DocumentSnapshot } from 'firebase/firestore';

console.log('Initializing Firebase...');

const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const initializeFirebase = async (): Promise<{ app: FirebaseApp | null; auth: Auth | null }> => {
  if (typeof window === 'undefined') {
    return { app: null, auth: null };
  }

  try {
    if (!getApps().length) {
      console.log('Initializing Firebase app...');
      const firebaseApp = initializeApp(firebaseConfig);
      const firebaseAuth = getAuth(firebaseApp);
      
      // Enable persistence for better UX
      await setPersistence(firebaseAuth, browserLocalPersistence);
      
      console.log('Firebase initialized successfully');
      
      // Initialize Firestore
      const firestore = getFirestore(firebaseApp);
      
      // Update module-level variables
      app = firebaseApp;
      auth = firebaseAuth;
      db = firestore;
      
      return { app, auth };
    } else {
      const existingApp = getApp();
      const existingAuth = getAuth(existingApp);
      
      // Update module-level variables
      app = existingApp;
      auth = existingAuth;
      
      console.log('Using existing Firebase app');
      return { app, auth };
    }
  } catch (error) {
    console.error('Firebase initialization error', error);
    throw error;
  }
};

// Initialize Firebase immediately when this module is imported
const firebasePromise = initializeFirebase();

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export auth methods
export { 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignInAnonymously as signInAnonymously,
  type User,
  firebasePromise
};

export const getFirebaseAuth = (): Auth => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is not available on the server side.');
  }
  
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Make sure to call initializeFirebase() first.');
  }
  
  return auth;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase App is not available on the server side.');
  }
  
  if (!app) {
    throw new Error('Firebase App not initialized. Make sure to call initializeFirebase() first.');
  }
  
  return app;
};

// Firestore functions
export const getFirestoreDb = (): Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

// Trip collection reference
const getTripsCollection = (userId: string) => {
  return collection(getFirestoreDb(), 'users', userId, 'trips');
};

// Trip operations
export const tripService = {
  // Create a new trip
  createTrip: async (userId: string, tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tripsRef = getTripsCollection(userId);
    const newTrip = {
      ...tripData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(tripsRef, newTrip);
    return { id: docRef.id, ...newTrip };
  },

  // Get all trips for a user
  getTrips: async (userId: string): Promise<Trip[]> => {
    const tripsRef = getTripsCollection(userId);
    const snapshot = await getDocs(tripsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Trip));
  },

  // Get a single trip
  getTrip: async (userId: string, tripId: string): Promise<Trip | null> => {
    const tripRef = doc(getFirestoreDb(), 'users', userId, 'trips', tripId);
    const docSnap = await getDoc(tripRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Trip;
    }
    return null;
  },

  // Update a trip
  updateTrip: async (userId: string, tripId: string, updates: Partial<Trip>) => {
    const tripRef = doc(getFirestoreDb(), 'users', userId, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a trip
  deleteTrip: async (userId: string, tripId: string) => {
    const tripRef = doc(getFirestoreDb(), 'users', userId, 'trips', tripId);
    await deleteDoc(tripRef);
  },

  // Toggle favorite status
  toggleFavorite: async (userId: string, tripId: string, currentStatus: boolean) => {
    const tripRef = doc(getFirestoreDb(), 'users', userId, 'trips', tripId);
    await updateDoc(tripRef, {
      isFavorite: !currentStatus,
      updatedAt: Timestamp.now()
    });
  }
};

export default getFirebaseApp;
