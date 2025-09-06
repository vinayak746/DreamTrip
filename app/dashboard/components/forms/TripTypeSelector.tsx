'use client';

import { ChangeEvent } from 'react';
import { TripType } from '@/types/trip';

const typeIcons = {
  leisure: '🏖️',
  business: '💼',
  adventure: '🌋',
  hiking: '🥾',
  family: '👨‍👩‍👧‍👦',
  roadtrip: '🚗',
  beach: '🏝️',
  mountain: '⛰️',
  city: '🏙️',
  cruise: '🚢',
  solo: '🧳',
  other: '✈️'
};

const typeLabels = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  hiking: 'Hiking',
  family: 'Family',
  roadtrip: 'Road Trip',
  beach: 'Beach',
  mountain: 'Mountain',
  city: 'City',
  cruise: 'Cruise',
  solo: 'Solo',
  other: 'Other'
};

interface TripTypeSelectorProps {
  selectedType: TripType;
  onTypeChange: (type: TripType) => void;
}

export function TripTypeSelector({ selectedType, onTypeChange }: TripTypeSelectorProps) {
  const tripTypes = Object.keys(typeIcons) as TripType[];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Trip Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {tripTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
              selectedType === type
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-xl mr-2">{typeIcons[type]}</span>
            <span className="text-sm font-medium">{typeLabels[type]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
