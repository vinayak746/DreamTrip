'use client';

import { ChangeEvent } from 'react';

export function TripDescription({
  description,
  onDescriptionChange,
}: {
  description: string;
  onDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <div className="mt-1">
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={onDescriptionChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Tell us about your trip..."
        />
      </div>
    </div>
  );
}
