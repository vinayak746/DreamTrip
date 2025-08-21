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
      {/* Header with Search */}
      <div className="bg-indigo-600 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-white">My Trips</h1>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Trip
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Filter Chips */}
        <div className="mb-8 flex space-x-2 overflow-x-auto pb-2">
          {['all', 'leisure', 'business', 'adventure'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm p-8">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
              <FiMapPin className="h-full w-full mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching trips found' : 'No trips yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'We couldn\'t find any trips matching your search. Try adjusting your filters.'
                : 'Plan your next adventure by creating a new trip.'}
            </p>
            <div>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2 h-5 w-5" />
                Create New Trip
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
