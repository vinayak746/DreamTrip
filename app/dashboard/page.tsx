'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { FiLogOut, FiUser, FiGlobe, FiMapPin, FiCalendar, FiSearch } from 'react-icons/fi';

// Fallback components in case react-icons is not available
interface IconProps {
  className?: string;
}

const LogOutIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>🚪</span>;
const UserIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>👤</span>;
const GlobeIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>🌍</span>;
const MapPinIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>📍</span>;
const CalendarIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>📅</span>;
const SearchIcon: React.FC<IconProps> = ({ className = '' }) => <span className={className}>🔍</span>;

type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'in-progress' | 'completed';
};

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Paris, France',
      startDate: '2023-12-15',
      endDate: '2023-12-22',
      status: 'upcoming'
    },
    {
      id: '2',
      destination: 'Tokyo, Japan',
      startDate: '2024-03-10',
      endDate: '2024-03-24',
      status: 'upcoming'
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">DreamTrip</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${activeTab === 'dashboard' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <GlobeIcon className="mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('trips')}
                  className={`${activeTab === 'trips' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <MapPinIcon className="mr-1" />
                  My Trips
                </button>
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`${activeTab === 'plan' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <CalendarIcon className="mr-1" />
                  Plan a Trip
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-8 w-8 rounded-full bg-indigo-100 p-1.5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">{user.email || 'User'}</div>
                    <div className="text-xs text-gray-500">
                      {user.isAnonymous ? 'Guest User' : 'Member'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOutIcon className="mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Upcoming Trips */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Trips</h3>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  + New Trip
                </button>
              </div>
              
              {trips.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <div key={trip.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <GlobeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {trip.destination}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                  {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                                  {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                          <span className="font-medium text-indigo-600 hover:text-indigo-500">
                            View details
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h3>
                  <p className="text-sm text-gray-500 mb-4">Start planning your next adventure!</p>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Plan a Trip
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="px-4 py-5 border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors duration-150"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                        <CalendarIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Plan a New Trip</h4>
                        <p className="mt-1 text-sm text-gray-500">Start planning your next adventure</p>
                      </div>
                    </div>
                  </button>
                  <button className="px-4 py-5 border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors duration-150">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                        <SearchIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Explore Destinations</h4>
                        <p className="mt-1 text-sm text-gray-500">Find your next dream destination</p>
                      </div>
                    </div>
                  </button>
                  <button className="px-4 py-5 border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors duration-150">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Profile Settings</h4>
                        <p className="mt-1 text-sm text-gray-500">Update your account information</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">New trip to Paris added</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </li>
                  <li className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Completed trip to Tokyo</p>
                        <p className="text-sm text-gray-500">1 week ago</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-full py-3 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'}`}
          >
            <GlobeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex flex-col items-center justify-center w-full py-3 ${activeTab === 'trips' ? 'text-indigo-600' : 'text-gray-500'}`}
          >
            <MapPinIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Trips</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center justify-center w-full py-3 ${activeTab === 'plan' ? 'text-indigo-600' : 'text-gray-500'}`}
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Plan</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full py-3 text-gray-500"
          >
            <LogOutIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
