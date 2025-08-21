'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiCreditCard, FiMail, FiPhone } from 'react-icons/fi';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Mock data
  const booking = {
    id,
    tripTitle: 'Summer Getaway to Bali',
    date: '2024-06-15',
    duration: '7 days',
    guests: 2,
    total: 2500,
    status: 'Confirmed',
    bookingNumber: 'BK20240615001',
    activities: [
      { id: '1', name: 'Luxury Villa Stay', price: 1500 },
      { id: '2', name: 'Airport Transfer', price: 50 },
      { id: '3', name: 'City Tour', price: 100 },
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
            <h1 className="text-2xl font-bold">Booking Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b-2 border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{booking.tripTitle}</h2>
                <div className="flex items-center mt-2 text-gray-600">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {booking.status}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Booking #{booking.bookingNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiCalendar className="mr-2 text-indigo-600" />
                  Trip Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{booking.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium">{booking.guests} {booking.guests === 1 ? 'Person' : 'People'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiUser className="mr-2 text-indigo-600" />
                  Guest Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FiMail className="mr-2 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="mr-2 text-gray-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiCreditCard className="mr-2 text-indigo-600" />
                  Payment
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${booking.total - 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span>$100.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                    <span>Total</span>
                    <span>${booking.total}.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-4">
                {booking.activities.map((activity) => (
                  <div key={activity.id} className="flex justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                    </div>
                    <span className="font-medium">${activity.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
