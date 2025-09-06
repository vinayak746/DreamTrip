'client';

import { useState } from 'react';
import { Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TripDay as SharedTripDay } from '@/types/trip';

type Activity = {
  id: string;
  name: string;
  location?: string;
  time?: string;
};

type TripDay = Omit<SharedTripDay, 'date' | 'activities'> & {
  date?: string;
  activities: Activity[];
};

type TripItineraryPlannerProps = {
  days: TripDay[];
  onChange: (days: TripDay[]) => void;
};

export function TripItineraryPlanner({ days = [], onChange }: TripItineraryPlannerProps) {
  const addDay = () => {
    onChange([...days, {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      location: '',
      activities: [{ id: Date.now().toString(), name: '' }]
    }]);
  };

  const updateDay = (id: string, updates: Partial<TripDay>) => {
    onChange(days.map(day => day.id === id ? { ...day, ...updates } : day));
  };

  const removeDay = (id: string) => {
    onChange(days.filter(day => day.id !== id));
  };

  const addActivity = (dayId: string) => {
    onChange(days.map(day => ({
      ...day,
      activities: day.id === dayId 
        ? [...day.activities, { id: Date.now().toString(), name: '' }] 
        : day.activities
    })));
  };

  const updateActivity = (dayId: string, activityId: string, updates: Partial<Activity>) => {
    onChange(days.map(day => ({
      ...day,
      activities: day.activities.map(activity => 
        activity.id === activityId ? { ...activity, ...updates } : activity
      )
    })));
  };

  const removeActivity = (dayId: string, activityId: string) => {
    onChange(days.map(day => ({
      ...day,
      activities: day.activities.filter(a => a.id !== activityId)
    })));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Day-by-Day Itinerary</h3>
        <Button type="button" onClick={addDay} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Day
        </Button>
      </div>

      {days.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No days planned yet</p>
          <Button type="button" onClick={addDay}>
            Plan Your First Day
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day, dayIndex) => (
            <div key={day.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Day {dayIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDay(day.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Date</label>
                    <input
                      type="date"
                      value={day.date}
                      onChange={(e) => updateDay(day.id, { date: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={day.location}
                        onChange={(e) => updateDay(day.id, { location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full pl-10 p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <h5 className="font-medium text-sm text-gray-700">Activities</h5>
                {day.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={activity.name}
                        onChange={(e) => updateActivity(day.id, activity.id, { name: e.target.value })}
                        placeholder="Activity name"
                        className="w-full p-2 border-b"
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <input
                          type="time"
                          value={activity.time}
                          onChange={(e) => updateActivity(day.id, activity.id, { time: e.target.value })}
                          className="p-1 bg-gray-50 rounded"
                        />
                        <MapPin className="h-4 w-4 ml-2" />
                        <input
                          type="text"
                          value={activity.location || ''}
                          onChange={(e) => updateActivity(day.id, activity.id, { location: e.target.value })}
                          placeholder="Location"
                          className="p-1 bg-gray-50 rounded flex-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity(day.id, activity.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addActivity(day.id)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Activity
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
