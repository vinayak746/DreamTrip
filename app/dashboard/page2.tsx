'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch, FiMapPin, FiCalendar, FiStar } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const NewTripForm = dynamic(() => import('./components/NewTripForm'), { ssr: false });

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

interface TripDay {
  day: number;
  location: string;
  activities: string[];
}

interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  saved: number;
  days: TripDay[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600">Plan and manage your adventures</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2.5 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors" onClick={() => setShowNewTripForm(true)}>
          <FiPlus className="mr-2" size={18} />
          New Trip
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={trip.imageUrl}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full">
                  <FiStar className={trip.saved > 0 ? 'text-yellow-400 fill-current' : 'text-gray-400'} size={18} />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-semibold">{trip.title}</h3>
                  <div className="flex items-center text-sm opacity-90">
                    <FiMapPin className="mr-1.5" size={14} />
                    <span>{trip.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1.5 text-indigo-500" size={14} />
                    <span>{formatDate(trip.startDate)}</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{trip.saved} saved</span>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    
  );
}
