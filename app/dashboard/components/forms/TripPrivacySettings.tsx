'use client';

import { Switch } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function TripPrivacySettings({
  isPublic,
  onTogglePrivacy,
}: {
  isPublic: boolean;
  onTogglePrivacy: (isPublic: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <input
          id="trip-privacy"
          name="trip-privacy"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => onTogglePrivacy(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="trip-privacy" className="ml-2 block text-sm">
          <span className="font-medium text-gray-900">Make trip public</span>
          <p className="text-gray-500">
            {isPublic
              ? ' This trip will be visible to everyone.'
              : ' This trip will only be visible to you.'}
          </p>
        </label>
      </div>
    </div>
  );
}
