import { useState, useCallback } from 'react';
import { Trip } from '../types';
import { initialTrip } from '../data/initialData';

const STORAGE_KEY = 'travel-planner-trips-v1';

function migrate(trips: Trip[]): Trip[] {
  return trips.map(t => ({ ...t, transfers: t.transfers ?? [] }));
}

function load(): Trip[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return migrate(JSON.parse(stored));
    // Migrate old single-trip storage
    const old = localStorage.getItem('honeymoon-trip-v1');
    if (old) return migrate([JSON.parse(old)]);
    return [initialTrip];
  } catch {
    return [initialTrip];
  }
}

function save(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(load);

  const addTrip = useCallback((trip: Trip) => {
    setTrips(prev => {
      const next = [...prev, trip];
      save(next);
      return next;
    });
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    setTrips(prev => {
      const next = prev.map(t => t.id === trip.id ? trip : t);
      save(next);
      return next;
    });
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    setTrips(prev => {
      const next = prev.filter(t => t.id !== tripId);
      save(next);
      return next;
    });
  }, []);

  return { trips, addTrip, updateTrip, deleteTrip };
}
