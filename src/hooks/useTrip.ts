import { useCallback } from 'react';
import { Trip, Activity, Restaurant, Transport, Alert, AlertStatus, BudgetSummary, Hotel, Flight, Transfer, BookingStatus } from '../types';

export function useTrip(trip: Trip, onChange: (trip: Trip) => void) {

  const set = useCallback((updater: (prev: Trip) => Trip) => {
    onChange(updater(trip));
  }, [trip, onChange]);

  // ── Destinations / Hotels ────────────────────────────────────────────────
  const updateHotel = useCallback((destId: string, hotel: Hotel) => {
    set(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => d.id === destId ? { ...d, hotel } : d),
    }));
  }, [set]);

  // ── Activities ────────────────────────────────────────────────────────────
  const addActivity = useCallback((dayId: string, activity: Activity) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, activities: [...d.activities, activity] } : d),
    }));
  }, [set]);

  const updateActivity = useCallback((dayId: string, activity: Activity) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, activities: d.activities.map(a => a.id === activity.id ? activity : a) } : d
      ),
    }));
  }, [set]);

  const deleteActivity = useCallback((dayId: string, activityId: string) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== activityId) } : d
      ),
    }));
  }, [set]);

  const toggleActivityBooked = useCallback((dayId: string, activityId: string) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, activities: d.activities.map(a => a.id === activityId ? { ...a, booked: !a.booked } : a) }
          : d
      ),
    }));
  }, [set]);

  const reorderActivities = useCallback((dayId: string, sourceIndex: number, destIndex: number) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.id !== dayId) return d;
        const acts = [...d.activities];
        const [removed] = acts.splice(sourceIndex, 1);
        acts.splice(destIndex, 0, removed);
        return { ...d, activities: acts };
      }),
    }));
  }, [set]);

  // ── Restaurants ──────────────────────────────────────────────────────────
  const addRestaurant = useCallback((dayId: string, restaurant: Restaurant) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, restaurants: [...d.restaurants, restaurant] } : d),
    }));
  }, [set]);

  const updateRestaurant = useCallback((dayId: string, restaurant: Restaurant) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, restaurants: d.restaurants.map(r => r.id === restaurant.id ? restaurant : r) } : d
      ),
    }));
  }, [set]);

  const deleteRestaurant = useCallback((dayId: string, restaurantId: string) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, restaurants: d.restaurants.filter(r => r.id !== restaurantId) } : d
      ),
    }));
  }, [set]);

  // ── Transports ───────────────────────────────────────────────────────────
  const addTransport = useCallback((dayId: string, transport: Transport) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, transports: [...d.transports, transport] } : d),
    }));
  }, [set]);

  const updateTransport = useCallback((dayId: string, transport: Transport) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, transports: d.transports.map(t => t.id === transport.id ? transport : t) } : d
      ),
    }));
  }, [set]);

  const deleteTransport = useCallback((dayId: string, transportId: string) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, transports: d.transports.filter(t => t.id !== transportId) } : d
      ),
    }));
  }, [set]);

  const toggleTransportBooked = useCallback((dayId: string, transportId: string) => {
    set(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId
          ? { ...d, transports: d.transports.map(t => t.id === transportId ? { ...t, booked: !t.booked } : t) }
          : d
      ),
    }));
  }, [set]);

  // ── Flights ──────────────────────────────────────────────────────────────
  const addFlight = useCallback((flight: Flight) => {
    set(prev => ({ ...prev, flights: [...(prev.flights ?? []), flight] }));
  }, [set]);

  const updateFlight = useCallback((flight: Flight) => {
    set(prev => ({ ...prev, flights: (prev.flights ?? []).map(f => f.id === flight.id ? flight : f) }));
  }, [set]);

  const deleteFlight = useCallback((flightId: string) => {
    set(prev => ({ ...prev, flights: (prev.flights ?? []).filter(f => f.id !== flightId) }));
  }, [set]);

  const toggleFlightBooked = useCallback((flightId: string) => {
    set(prev => ({ ...prev, flights: (prev.flights ?? []).map(f => f.id === flightId ? { ...f, booked: !f.booked } : f) }));
  }, [set]);

  // ── Transfers ────────────────────────────────────────────────────────────
  const addTransfer = useCallback((transfer: Transfer) => {
    set(prev => ({ ...prev, transfers: [...(prev.transfers ?? []), transfer] }));
  }, [set]);

  const updateTransfer = useCallback((transfer: Transfer) => {
    set(prev => ({
      ...prev,
      transfers: (prev.transfers ?? []).map(t => t.id === transfer.id ? transfer : t),
    }));
  }, [set]);

  const deleteTransfer = useCallback((transferId: string) => {
    set(prev => ({ ...prev, transfers: (prev.transfers ?? []).filter(t => t.id !== transferId) }));
  }, [set]);

  const cycleSegmentStatus = useCallback((transferId: string, segmentId: string) => {
    const cycle: BookingStatus[] = ['pending', 'booked', 'confirmed'];
    set(prev => ({
      ...prev,
      transfers: (prev.transfers ?? []).map(t => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          segments: t.segments.map(s => {
            if (s.id !== segmentId) return s;
            const next = (cycle.indexOf(s.bookingStatus) + 1) % cycle.length;
            return { ...s, bookingStatus: cycle[next] };
          }),
        };
      }),
    }));
  }, [set]);

  // ── Alerts ───────────────────────────────────────────────────────────────
  const toggleAlertStatus = useCallback((alertId: string) => {
    const cycle: AlertStatus[] = ['pending', 'booked', 'confirmed'];
    set(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => {
        if (a.id !== alertId) return a;
        const nextIdx = (cycle.indexOf(a.status) + 1) % cycle.length;
        return { ...a, status: cycle[nextIdx] };
      }),
    }));
  }, [set]);

  const addAlert = useCallback((alert: Alert) => {
    set(prev => ({ ...prev, alerts: [...prev.alerts, alert] }));
  }, [set]);

  const deleteAlert = useCallback((alertId: string) => {
    set(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== alertId) }));
  }, [set]);

  // ── Budget ───────────────────────────────────────────────────────────────
  const getBudgetSummary = useCallback((): BudgetSummary => {
    let hotels = 0, activities = 0, food = 0, transport = 0;
    const byDestination: Record<string, number> = {};

    trip.destinations.forEach(dest => {
      const h = dest.hotel.costPerNight * dest.hotel.nights;
      hotels += h;
      byDestination[dest.id] = h;
    });

    trip.days.forEach(day => {
      day.activities.forEach(a => { activities += a.cost; byDestination[day.destination] = (byDestination[day.destination] ?? 0) + a.cost; });
      day.restaurants.forEach(r => { food += r.estimatedCost; byDestination[day.destination] = (byDestination[day.destination] ?? 0) + r.estimatedCost; });
      day.transports.forEach(t => { transport += t.cost; byDestination[day.destination] = (byDestination[day.destination] ?? 0) + t.cost; });
    });

    return { total: hotels + activities + food + transport, hotels, activities, food, transport, byDestination };
  }, [trip]);

  return {
    trip,
    updateHotel,
    addFlight, updateFlight, deleteFlight, toggleFlightBooked,
    addActivity, updateActivity, deleteActivity, reorderActivities, toggleActivityBooked,
    addRestaurant, updateRestaurant, deleteRestaurant,
    addTransport, updateTransport, deleteTransport, toggleTransportBooked,
    addTransfer, updateTransfer, deleteTransfer, cycleSegmentStatus,
    toggleAlertStatus, addAlert, deleteAlert,
    getBudgetSummary,
  };
}
