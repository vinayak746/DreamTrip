export type TripType = 'leisure' | 'business' | 'adventure' | 'hiking' | 'family';

export interface TripDay {
  day: number;
  location: string;
  activities: string[];
}

export interface TripFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  type: TripType;
  description?: string;
  isFavorite?: boolean;
  imageFile?: File;
}

export interface Trip extends Omit<TripFormData, 'imageUrl'> {
  id: string;
  imageUrl: string;
  saved: number;
  days: TripDay[];
  isFavorite: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
