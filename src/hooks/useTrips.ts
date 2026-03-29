import { useState, useEffect, useCallback } from 'react';
import { Trip } from '../types';
import { supabase } from '../lib/supabase';
import { initialTrip } from '../data/initialData';

// ── Migration helper ──────────────────────────────────────────────────────────
// Ensures old trips (from localStorage or DB) have all new fields.

function migrate(trips: Trip[]): Trip[] {
  return trips.map(t => ({
    ...t,
    flights:   t.flights   ?? [],
    transfers: t.transfers ?? [],
  }));
}

// ── LocalStorage fallback ─────────────────────────────────────────────────────
// Used only on first launch to migrate existing data into Supabase.

function loadLocal(): Trip[] {
  try {
    const v1 = localStorage.getItem('travel-planner-trips-v1');
    if (v1) return migrate(JSON.parse(v1));
    const old = localStorage.getItem('honeymoon-trip-v1');
    if (old) return migrate([JSON.parse(old)]);
  } catch { /* ignore */ }
  return [initialTrip];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTrips() {
  const [trips, setTrips]     = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Initial load ──
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('data')
          .order('created_at');

        if (error) throw error;

        if (data && data.length > 0) {
          // Normal case: data already in Supabase
          setTrips(migrate(data.map((row: { data: Trip }) => row.data)));
        } else {
          // First launch: migrate from localStorage / initialData
          const local = loadLocal();
          setTrips(local);
          await Promise.all(
            local.map(trip =>
              supabase.from('trips').upsert({ id: trip.id, data: trip })
            )
          );
        }
      } catch (err) {
        console.error('Supabase load failed:', err);
        setError('Impossible de charger les données. Vérifiez votre connexion.');
        setTrips(loadLocal()); // offline fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Mutations (optimistic update + async Supabase sync) ──

  const addTrip = useCallback((trip: Trip) => {
    setTrips(prev => [...prev, trip]);
    supabase
      .from('trips')
      .insert({ id: trip.id, data: trip })
      .then(({ error }) => { if (error) console.error('addTrip failed:', error); });
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
    supabase
      .from('trips')
      .upsert({ id: trip.id, data: trip, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error('updateTrip failed:', error); });
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .then(({ error }) => { if (error) console.error('deleteTrip failed:', error); });
  }, []);

  return { trips, loading, error, addTrip, updateTrip, deleteTrip };
}
