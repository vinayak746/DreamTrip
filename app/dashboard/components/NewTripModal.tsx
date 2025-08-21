'use client';

import { useState } from 'react';
import { FiX, FiMapPin, FiCalendar, FiTag } from 'react-icons/fi';

type TripType = 'leisure' | 'business' | 'adventure';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripData: {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    type: TripType;
  }) => void;
}

export default function NewTripModal({ isOpen, onClose, onSubmit }: NewTripModalProps) {
  const [tripData, setTripData] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    type: 'leisure' as TripType
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tripData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Plan a New Trip</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Summer Vacation 2024"
                  value={tripData.title}
                  onChange={(e) => setTripData({...tripData, title: e.target.value})}
                />
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Where are you going?"
                  value={tripData.location}
                  onChange={(e) => setTripData({...tripData, location: e.target.value})}
                />
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={tripData.startDate}
                    onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                  />
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={tripData.endDate}
                    onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                    min={tripData.startDate}
                  />
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
              <div className="relative">
                <select
                  className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  value={tripData.type}
                  onChange={(e) => setTripData({...tripData, type: e.target.value as TripType})}
                >
                  <option value="leisure">Leisure</option>
                  <option value="adventure">Adventure</option>
                  <option value="hiking">Hiking</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                </select>
                <FiTag className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
