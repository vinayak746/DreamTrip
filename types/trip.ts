export type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family' | 'roadtrip' | 'beach' | 'mountain' | 'city' | 'cruise' | 'solo' | 'other';

export interface Activity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  time?: string;
  cost?: number;
  notes?: string;
  isBooked?: boolean;
  bookingReference?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  time?: string;
  cost?: number;
  notes?: string;
  isBooked?: boolean;
}

export interface TripDay {
  id: string;
  day?: number;
  date?: string;
  location: string;
  activities: Activity[];
  description?: string;
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

export interface BudgetExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

export interface TripBudget {
  total: number;
  currency: string;
  expenses: BudgetExpense[];
}

export interface TripFormData {
  // Basic trip info
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  description: string;
  
  // Images
  imageFiles?: File[];
  imageUrl: string;
  imageUrls: string[];
  coverImageIndex: number;
  
  // Metadata
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  
  // Itinerary
  days: TripDay[];
  
  // Budget
  budget?: TripBudget;
  
  // Collaboration
  collaborators: string[]; // Array of user IDs
  
  // System fields
  saved: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip extends Omit<TripFormData, 'imageFiles'> {
  id: string;
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
