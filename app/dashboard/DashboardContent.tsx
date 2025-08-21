'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiSearch, FiPlus, FiMapPin, FiCalendar, FiClock, FiFilter } from 'react-icons/fi';
import TripCard from './components/TripCard';

interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  type: 'leisure' | 'business' | 'adventure';
}

export default function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Mock data - will be replaced with Firestore data
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      title: 'Summer Getaway',
      location: 'Bali, Indonesia',
      startDate: '2024-06-15',
      endDate: '2024-06-25',
      type: 'leisure',
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Business Conference',
      location: 'New York, USA',
      startDate: '2024-07-10',
      endDate: '2024-07-15',
      type: 'business',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Mountain Adventure',
      location: 'Swiss Alps',
      startDate: '2024-08-05',
      endDate: '2024-08-12',
      type: 'adventure',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const handleViewDetails = (tripId: string) => {
    // TODO: Navigate to trip details page
    console.log('Viewing details for trip:', tripId);
  };

  const handleCreateNew = () => {
    // TODO: Implement create new trip
    console.log('Create new trip');
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeFilter === 'all' || trip.type === activeFilter;
    return matchesSearch && matchesType;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Trip
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['all', 'leisure', 'business', 'adventure'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <FiMapPin className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? 'No trips match your search. Try a different search term.'
                : 'Get started by creating your first trip.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                New Trip
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                {...trip}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
