'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from './components/DashboardHeader';
import SearchAndFilter, { TripType } from './components/SearchAndFilter';
import ItineraryCard from './components/ItineraryCard';

export interface Activity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  imageUrl?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: TripType;
  description: string;
  activities: Activity[];
  isFavorite: boolean;
  coverImage?: string;
}

export default function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState<TripType | 'all'>('all');
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    {
      id: '1',
      title: 'Summer Vacation in Bali',
      destination: 'Bali, Indonesia',
      startDate: '2024-06-15',
      endDate: '2024-06-25',
      type: 'leisure',
      description: 'A relaxing 10-day trip to enjoy the beaches and culture of Bali',
      activities: [
        {
          id: 'a1',
          name: 'Visit Uluwatu Temple',
          date: '2024-06-16',
          time: '14:00',
          location: 'Uluwatu',
          notes: 'Watch the Kecak dance at sunset',
          imageUrl: '/bali-temple.jpg'
        }
      ],
      isFavorite: true,
      coverImage: '/bali-cover.jpg'
    },
    {
      id: '2',
      title: 'Business Conference',
      destination: 'New York, USA',
      startDate: '2024-07-10',
      endDate: '2024-07-15',
      type: 'business',
      description: 'Attending the annual tech conference',
      activities: [],
      isFavorite: false
    }
  ]);

  const toggleFavorite = (id: string) => {
    setItineraries(itineraries.map(itinerary => 
      itinerary.id === id 
        ? { ...itinerary, isFavorite: !itinerary.isFavorite } 
        : itinerary
    ));
  };

  const filteredItineraries = itineraries.filter(itinerary => {
    const matchesSearch = itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = tripTypeFilter === 'all' || itinerary.type === tripTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateNew = () => {
    // TODO: Implement create new itinerary
    console.log('Create new itinerary');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user} 
        onLogout={logout} 
      />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <SearchAndFilter 
          searchQuery={searchQuery}
          tripTypeFilter={tripTypeFilter}
          onSearchChange={setSearchQuery}
          onFilterChange={setTripTypeFilter}
          onCreateNew={handleCreateNew}
        />

        {filteredItineraries.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No itineraries found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new itinerary.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  />
                </svg>
                New Itinerary
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                {...itinerary}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );

}
