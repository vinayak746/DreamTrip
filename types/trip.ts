export type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family' | 'roadtrip' | 'beach' | 'mountain' | 'city' | 'cruise' | 'solo' | 'other';

export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  cost?: number;
  notes?: string;
  imageUrl?: string;
  isBooked: boolean;
  bookingReference?: string;
}

export interface TripDay {
  id: string;
  date: string;
  location: string;
  description?: string;
  activities: Activity[];
  notes?: string;
  images?: string[];
  accommodation?: {
    name: string;
    checkIn: string;
    checkOut: string;
    address: string;
    bookingReference?: string;
  };
  weather?: {
    high: number;
    low: number;
    condition: string;
    icon: string;
  };
}

export interface TripFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  description?: string;
  isFavorite?: boolean;
  imageFiles?: File[];
  imageUrl?: string; // For backward compatibility
  imageUrls?: string[]; // Made optional to match the form data
  days?: TripDay[];
  budget?: {
    total: number;
    currency: string;
    expenses: Array<{
      id: string;
      category: string;
      amount: number;
      description: string;
      date: string;
    }>;
  };
  collaborators?: string[]; // Array of user IDs
  isPublic?: boolean;
  tags?: string[];
}

export interface Trip extends Omit<TripFormData, 'imageFiles'> {
  id: string;
  imageUrl?: string; // For backward compatibility
  imageUrls?: string[]; // Made optional to match form data
  saved: number;
  days: TripDay[];
  isFavorite: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sharedWith?: Array<{
    userId: string;
    email: string;
    role: 'viewer' | 'editor' | 'admin';
  }>;
  stats?: {
    totalActivities: number;
    completedActivities: number;
    totalCost: number;
    daysCount: number;
  };
}
