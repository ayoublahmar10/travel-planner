import { useState, useEffect, useCallback } from 'react';
import { Trip, Activity, Restaurant, Transport, Alert, AlertStatus, BudgetSummary } from '../types';
import { initialTrip } from '../data/initialData';

const STORAGE_KEY = 'honeymoon-trip-v1';

export function useTrip() {
  const [trip, setTrip] = useState<Trip>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialTrip;
    } catch {
      return initialTrip;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  }, [trip]);

  // ── Destinations / Hotels ────────────────────────────────────────────────
  const updateHotel = useCallback((destId: string, hotel: import('../types').Hotel) => {
    setTrip(prev => ({
      ...prev,
      destinations: prev.destinations.map(d =>
        d.id === destId ? { ...d, hotel } : d
      ),
    }));
  }, []);

  // ── Activities ────────────────────────────────────────────────────────────
  const addActivity = useCallback((dayId: string, activity: Activity) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, activities: [...d.activities, activity] } : d
      ),
    }));
  }, []);

  const deleteActivity = useCallback((dayId: string, activityId: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter(a => a.id !== activityId) }
          : d
      ),
    }));
  }, []);

  const updateActivity = useCallback((dayId: string, activity: Activity) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: d.activities.map(a => a.id === activity.id ? activity : a) }
          : d
      ),
    }));
  }, []);

  const toggleActivityBooked = useCallback((dayId: string, activityId: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: d.activities.map(a => a.id === activityId ? { ...a, booked: !a.booked } : a) }
          : d
      ),
    }));
  }, []);

  const reorderActivities = useCallback((dayId: string, sourceIndex: number, destIndex: number) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.id !== dayId) return d;
        const acts = [...d.activities];
        const [removed] = acts.splice(sourceIndex, 1);
        acts.splice(destIndex, 0, removed);
        return { ...d, activities: acts };
      }),
    }));
  }, []);

  // ── Restaurants ──────────────────────────────────────────────────────────
  const addRestaurant = useCallback((dayId: string, restaurant: Restaurant) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, restaurants: [...d.restaurants, restaurant] } : d
      ),
    }));
  }, []);

  const updateRestaurant = useCallback((dayId: string, restaurant: Restaurant) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, restaurants: d.restaurants.map(r => r.id === restaurant.id ? restaurant : r) }
          : d
      ),
    }));
  }, []);

  const deleteRestaurant = useCallback((dayId: string, restaurantId: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, restaurants: d.restaurants.filter(r => r.id !== restaurantId) }
          : d
      ),
    }));
  }, []);

  // ── Transports ───────────────────────────────────────────────────────────
  const addTransport = useCallback((dayId: string, transport: Transport) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, transports: [...d.transports, transport] } : d
      ),
    }));
  }, []);

  const updateTransport = useCallback((dayId: string, transport: Transport) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, transports: d.transports.map(t => t.id === transport.id ? transport : t) }
          : d
      ),
    }));
  }, []);

  const toggleTransportBooked = useCallback((dayId: string, transportId: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, transports: d.transports.map(t => t.id === transportId ? { ...t, booked: !t.booked } : t) }
          : d
      ),
    }));
  }, []);

  const deleteTransport = useCallback((dayId: string, transportId: string) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, transports: d.transports.filter(t => t.id !== transportId) }
          : d
      ),
    }));
  }, []);

  // ── Alerts ───────────────────────────────────────────────────────────────
  const toggleAlertStatus = useCallback((alertId: string) => {
    const cycle: AlertStatus[] = ['pending', 'booked', 'confirmed'];
    setTrip(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => {
        if (a.id !== alertId) return a;
        const nextIdx = (cycle.indexOf(a.status) + 1) % cycle.length;
        return { ...a, status: cycle[nextIdx] };
      }),
    }));
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setTrip(prev => ({ ...prev, alerts: [...prev.alerts, alert] }));
  }, []);

  const deleteAlert = useCallback((alertId: string) => {
    setTrip(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== alertId) }));
  }, []);

  // ── Budget ───────────────────────────────────────────────────────────────
  const getBudgetSummary = useCallback((): BudgetSummary => {
    let hotels = 0;
    let activities = 0;
    let food = 0;
    let transport = 0;
    const byDestination: Record<string, number> = {};

    trip.destinations.forEach(dest => {
      hotels += dest.hotel.costPerNight * dest.hotel.nights;
      byDestination[dest.id] = dest.hotel.costPerNight * dest.hotel.nights;
    });

    trip.days.forEach(day => {
      day.activities.forEach(a => {
        activities += a.cost;
        byDestination[day.destination] = (byDestination[day.destination] ?? 0) + a.cost;
      });
      day.restaurants.forEach(r => {
        food += r.estimatedCost;
        byDestination[day.destination] = (byDestination[day.destination] ?? 0) + r.estimatedCost;
      });
      day.transports.forEach(t => {
        transport += t.cost;
        byDestination[day.destination] = (byDestination[day.destination] ?? 0) + t.cost;
      });
    });

    return { total: hotels + activities + food + transport, hotels, activities, food, transport, byDestination };
  }, [trip]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetTrip = useCallback(() => {
    setTrip(initialTrip);
  }, []);

  return {
    trip,
    updateHotel,
    addActivity, updateActivity, deleteActivity, reorderActivities, toggleActivityBooked,
    addRestaurant, updateRestaurant, deleteRestaurant,
    addTransport, updateTransport, deleteTransport, toggleTransportBooked,
    toggleAlertStatus, addAlert, deleteAlert,
    getBudgetSummary,
    resetTrip,
  };
}
