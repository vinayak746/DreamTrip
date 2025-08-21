'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiLogOut, FiArrowRight } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    memberSince: '2023',
    trips: 12,
    reviews: 8,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full text-indigo-600 shadow-md">
                <FiEdit2 size={16} />
              </button>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
              <p>Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <FiMail className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FiPhone className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{user?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <FiUser className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-medium text-xs">{user?.uid || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-100">
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className="text-lg font-bold text-indigo-600">{user?.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
                  <p className="text-sm text-gray-600">Last Sign In</p>
                  <p className="text-sm font-medium text-green-600">
                    {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-100">
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="text-sm font-medium text-yellow-600">
                    {user?.providerData?.[0]?.providerId || 'Unknown'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <p className="text-sm text-gray-600">Anonymous</p>
                  <p className="text-lg font-bold text-purple-600">{user?.isAnonymous ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-100 transition-colors">
                <span>Notification Settings</span>
                <FiArrowRight />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-100 transition-colors">
                <span>Payment Methods</span>
                <FiArrowRight />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-100 transition-colors">
                <span>Privacy Settings</span>
                <FiArrowRight />
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center p-4 text-red-600 hover:bg-red-50 rounded-lg border-2 border-red-100 transition-colors mt-4"
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
