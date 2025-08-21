export type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

export interface TripDay {
  day: number;
  location: string;
  activities: string[];
}

export interface TripFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  imageUrl?: string;
}

export interface Trip extends TripFormData {
  id: string;
  saved: number;
  days: TripDay[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
