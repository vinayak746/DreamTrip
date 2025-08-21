'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiLogOut, FiArrowRight, FiLoader } from 'react-icons/fi';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/firebase/config';
import { useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfile>({
    name: user?.displayName || 'User',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: user?.photoURL || '/default-avatar.png'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(getFirestoreDb(), 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(prev => ({
            ...prev,
            ...userDoc.data(),
            email: user.email || prev.email,
            name: user.displayName || prev.name,
            profilePicture: user.photoURL || prev.profilePicture
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      await updateDoc(doc(getFirestoreDb(), 'users', user.uid), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <img 
                src={userData.profilePicture} 
                alt={userData.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.png';
                }}
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
                  <FiEdit2 className="text-indigo-600" />
                </button>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-indigo-100">{userData.email}</p>
              {userData.location && (
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <FiMapPin className="mr-1" />
                  <span>{userData.location}</span>
                </div>
              )}
              <p className="text-indigo-100 text-sm mt-1">
                Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : 'Unknown'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-auto">
              {isEditing ? (
                <div className="space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={userData.location || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                  <input
                    type="url"
                    name="profilePicture"
                    value={userData.profilePicture}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={userData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-gray-900">{userData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="text-gray-900">{userData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-gray-900">{userData.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{userData.bio || 'No bio provided'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <button 
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <FiLogOut className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
