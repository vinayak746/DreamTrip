export type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

export interface TripDay {
  day: number;
  location: string;
  activities: string[];
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl: string;
  saved: number;
  days: TripDay[];
  isFavorite?: boolean;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}
