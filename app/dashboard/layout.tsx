'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiHome, FiSettings, FiPlus, FiX, FiHeart, FiUser } from 'react-icons/fi';
import Link from 'next/link';

type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNewTripModal, setShowNewTripModal] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex flex-col w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-indigo-700">DreamTrip</h1>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className={`flex items-center px-4 py-2.5 rounded-lg ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiHome className="mr-3" size={20} />
              Dashboard
            </Link>
            <Link 
              href="/dashboard/favorites" 
              className={`flex items-center px-4 py-2.5 rounded-lg ${isActive('/dashboard/favorites') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiHeart className="mr-3" size={20} />
              Favourites
            </Link>
            
            <Link 
              href="/dashboard/profile" 
              className={`flex items-center px-4 py-2.5 rounded-lg ${isActive('/dashboard/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiUser className="mr-3" size={20} />
             Profile
            </Link>
          </nav>
          
          <div className="mt-auto pt-4">
            <button 
              onClick={() => setShowNewTripModal(true)}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="mr-2" size={18} />
              New Trip
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around items-center">
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard') ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <FiHome size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link 
            href="/dashboard/favorites" 
            className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard/favorites') ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <FiHeart size={20} />
            <span className="text-xs mt-1">Favorites</span>
          </Link>
          
          <button 
            onClick={() => setShowNewTripModal(true)}
            className="flex flex-col items-center p-2 text-indigo-600"
          >
            <div className="bg-indigo-600 text-white p-2 rounded-full -mt-6 mb-1 shadow-md">
              <FiPlus size={20} />
            </div>
            <span className="text-xs">New Trip</span>
          </button>
          
          <Link 
            href="/dashboard/profile" 
            className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard/profile') ? 'text-indigo-600' : 'text-gray-600'}`}
          >
            <FiUser size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 pb-20 md:pb-0">
        {children}
      </div>

      {/* New Trip Modal */}
      {/* {showNewTripModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b-2 border-gray-300 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Plan Your Trip</h2>
                <button 
                  onClick={() => setShowNewTripModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Start planning your perfect trip by filling in the details below.
              </p>
              {/* Trip form will be rendered here */}
              {/* <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-400">
                <p className="text-gray-500">Trip form will appear here</p>
              </div>
            </div>
          </div>
        </div>
      )} */} 
    </div>
  );
}
