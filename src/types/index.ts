export type ActivityType =
  | 'sightseeing'
  | 'adventure'
  | 'relaxation'
  | 'food'
  | 'culture'
  | 'water'
  | 'spa'
  | 'shopping';

export type TransportType =
  | 'flight'
  | 'ferry'
  | 'fastboat'
  | 'car'
  | 'taxi'
  | 'bike'
  | 'walk';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type AlertStatus = 'pending' | 'booked' | 'confirmed';
export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertCategory = 'hotel' | 'activity' | 'transport' | 'document' | 'other';

export type BookingStatus = 'pending' | 'booked' | 'confirmed';

export type TransferDifficulty = 'easy' | 'moderate' | 'challenging';

export type TransferSegmentType =
  | 'taxi'
  | 'private_car'
  | 'fastboat'
  | 'ferry'
  | 'walk'
  | 'bus'
  | 'motorbike'
  | 'buffer';

export interface TransferSegment {
  id: string;
  type: TransferSegmentType;
  from: string;
  to: string;
  durationMinutes: number;
  cost: number;
  isBuffer: boolean;
  bookingStatus: BookingStatus;
  provider?: string;
  notes?: string;
}

export interface Transfer {
  id: string;
  fromDestinationId: string;
  toDestinationId: string;
  date: string;
  departureTime: string;
  segments: TransferSegment[];
  difficulty?: TransferDifficulty;
  notes?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  costPerNight: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  cost: number;
  notes?: string;
  location?: string;
  booked: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  meal: MealType;
  estimatedCost: number;
  notes?: string;
  cuisine?: string;
}

export interface Transport {
  id: string;
  type: TransportType;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  cost: number;
  provider?: string;
  booked: boolean;
  notes?: string;
}

export interface DayPlan {
  id: string;
  date: string;
  location: string;
  destination: string;
  activities: Activity[];
  restaurants: Restaurant[];
  transports: Transport[];
  notes?: string;
}

export interface Destination {
  id: string;
  name: string;
  island: string;
  startDate: string;
  endDate: string;
  hotel: Hotel;
  description?: string;
  emoji?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: AlertStatus;
  priority: AlertPriority;
  category: AlertCategory;
  relatedDayId?: string;
}

export interface Flight {
  id: string;
  direction: 'outbound' | 'return';
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  cost: number;
  booked: boolean;
  notes?: string;
}

export interface Trip {
  id: string;
  title: string;
  subtitle: string;
  couple: string;
  startDate: string;
  endDate: string;
  destinations: Destination[];
  days: DayPlan[];
  flights: Flight[];
  transfers: Transfer[];
  alerts: Alert[];
}

export interface BudgetSummary {
  total: number;
  hotels: number;
  activities: number;
  food: number;
  transport: number;
  byDestination: Record<string, number>;
}
