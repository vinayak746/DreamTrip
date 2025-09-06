'use client';

import { ChangeEvent } from 'react';
import { FiCalendar } from 'react-icons/fi';

interface TripDateRangeProps {
  startDate: string;
  endDate: string;
  onDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function TripDateRange({ startDate, endDate, onDateChange }: TripDateRangeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={onDateChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
          End Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            min={startDate || new Date().toISOString().split('T')[0]}
            onChange={onDateChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={!startDate}
          />
          <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
