'use client';



import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  AuthError,
  UserCredential,
  Auth
} from 'firebase/auth';
import { 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously,
  firebasePromise,
  getFirebaseAuth,
  getFirebaseApp
} from '../firebase/config';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  loginAnonymously: () => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase Auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for Firebase to be initialized
        await firebasePromise;
        
        // Get the auth instance
        const currentAuth = getFirebaseAuth();
        
        // Set up auth state change listener
        const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
          console.log('Auth state changed:', user ? `User signed in: ${user.email || user.uid}` : 'No user');
          setUser(user);
          setLoading(false);
        });

        // Cleanup function
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const currentAuth = getFirebaseAuth();
      console.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(currentAuth, email, password);
      console.log('Sign in successful:', userCredential.user?.email);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError.code, authError.message);
      throw new Error(authError.message || 'Failed to sign in');
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      const currentAuth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(currentAuth, email, password);
      console.log('Sign up successful:', userCredential.user?.email);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Signup error:', authError.message);
      throw new Error(authError.message || 'Failed to create account');
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const currentAuth = getFirebaseAuth();
      console.log('Attempting Google sign in...');
      const result = await signInWithPopup(currentAuth, googleProvider);
      console.log('Google sign in successful:', result.user?.email);
      return result.user;
    } catch (error: any) {
      console.error('Google sign in error:', error.code, error.message);
      if (error.code !== 'auth/popup-closed-by-user') {
        throw new Error(error.message || 'Failed to sign in with Google');
      }
      return null;
    }
  }, []);

  const loginAnonymously = useCallback(async () => {
    try {
      const currentAuth = getFirebaseAuth();
      console.log('Attempting anonymous sign in...');
      const result = await signInAnonymously(currentAuth);
      console.log('Anonymous sign in successful');
      return result.user;
    } catch (error: any) {
      console.error('Anonymous sign in error:', error.code, error.message);
      throw new Error(error.message || 'Failed to sign in anonymously');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const currentAuth = getFirebaseAuth();
      await firebaseSignOut(currentAuth);
      console.log('User signed out successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Logout error:', authError.message);
      throw new Error(authError.message || 'Failed to sign out');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const currentAuth = getFirebaseAuth();
      await sendPasswordResetEmail(currentAuth, email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Password reset error:', authError.message);
      throw new Error(authError.message || 'Failed to send password reset email');
    }
  }, []);


  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    loginAnonymously,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
