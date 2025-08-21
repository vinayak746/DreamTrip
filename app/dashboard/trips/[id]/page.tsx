'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function TripDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Mock data
  const trip = {
    id,
    title: 'Summer Getaway',
    location: 'Bali, Indonesia',
    startDate: '2024-06-15',
    endDate: '2024-06-25',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'leisure',
    budget: 2500,
    travelers: 2,
    activities: [
      { id: '1', time: '09:00 AM', title: 'Arrival', location: 'Airport' },
      { id: '2', time: '11:00 AM', title: 'Check-in', location: 'Resort' },
      { id: '3', time: '02:00 PM', title: 'Lunch', location: 'Restaurant' },
    ],
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 rounded-lg border-2 border-gray-200 mr-4">
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Trip Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
          <div className="relative h-64">
            <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold">{trip.title}</h2>
              <div className="flex items-center">
                <FiMapPin className="mr-1.5" />
                <span>{trip.location}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <FiCalendar className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FiUsers className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Travelers</p>
                  <p className="font-medium">{trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FiDollarSign className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-medium">${trip.budget.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
            <div className="space-y-4">
              {trip.activities.map((activity) => (
                <div key={activity.id} className="flex p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                  <div className="mr-4 text-center">
                    <div className="text-sm font-medium text-indigo-600">{activity.time}</div>
                  </div>
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
