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
      
      // Update module-level variables
      app = firebaseApp;
      auth = firebaseAuth;
      
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

export default getFirebaseApp;
