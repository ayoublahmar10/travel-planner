import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, MapPin, Calendar, Heart, Trash2, ArrowRight, Plane, AlertTriangle } from 'lucide-react';
import { Trip, Destination, DayPlan } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);
const fieldCls = 'text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300 w-full';

// ── Create Trip Form ──────────────────────────────────────────────────────────

function CreateTripForm({ onCreate, onClose }: { onCreate: (trip: Trip) => void; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [base, setBase] = useState({ title: '', couple: '', startDate: '', endDate: '' });
  const [destinations, setDestinations] = useState([{ name: '', emoji: '📍', nights: '' }]);

  const addDest = () => setDestinations(p => [...p, { name: '', emoji: '📍', nights: '' }]);
  const removeDest = (i: number) => setDestinations(p => p.filter((_, idx) => idx !== i));

  const buildTrip = (): Trip => {
    const tripId = `trip-${uid()}`;
    let currentDate = new Date(base.startDate + 'T12:00:00');

    const builtDestinations: Destination[] = destinations.map((d, i) => {
      const nights = parseInt(d.nights) || 1;
      const startDate = currentDate.toISOString().split('T')[0];
      currentDate.setDate(currentDate.getDate() + nights);
      const endDate = currentDate.toISOString().split('T')[0];

      return {
        id: `dest-${uid()}`,
        name: d.name || `Destination ${i + 1}`,
        island: d.name,
        emoji: d.emoji,
        startDate,
        endDate,
        description: '',
        hotel: {
          id: `hotel-${uid()}`,
          name: 'À définir',
          address: '',
          costPerNight: 0,
          nights,
          checkIn: startDate,
          checkOut: endDate,
        },
      };
    });

    // Build days
    const days: DayPlan[] = [];
    let dayDate = new Date(base.startDate + 'T12:00:00');

    builtDestinations.forEach(dest => {
      const nights = dest.hotel.nights;
      for (let n = 0; n < nights; n++) {
        days.push({
          id: `day-${uid()}`,
          date: dayDate.toISOString().split('T')[0],
          location: dest.name,
          destination: dest.id,
          activities: [],
          restaurants: [],
          transports: [],
        });
        dayDate.setDate(dayDate.getDate() + 1);
      }
    });

    const endDate = builtDestinations[builtDestinations.length - 1]?.endDate ?? base.endDate;

    return {
      id: tripId,
      title: base.title,
      subtitle: '',
      couple: base.couple,
      startDate: base.startDate,
      endDate,
      destinations: builtDestinations,
      days,
      flights: [],
      transfers: [],
      alerts: [],
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    onCreate(buildTrip());
  };

  return (
    <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-sand">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark">Nouveau voyage</h2>
              <p className="text-xs text-gray-400 mt-0.5">Étape {step} sur 2</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors text-xl leading-none">×</button>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-coral-400' : 'bg-sand'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-coral-400' : 'bg-sand'}`} />
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nom du voyage</label>
                <input required className={fieldCls} placeholder="Ex: Lune de miel à Bali" value={base.title}
                  onChange={e => setBase(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Voyageurs</label>
                <input className={fieldCls} placeholder="Ex: Ayoub & Safa" value={base.couple}
                  onChange={e => setBase(p => ({ ...p, couple: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Départ</label>
                  <input required type="date" className={fieldCls} value={base.startDate}
                    onChange={e => setBase(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Retour</label>
                  <input type="date" className={fieldCls} value={base.endDate}
                    onChange={e => setBase(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-500">Ajoute tes destinations dans l'ordre du voyage.</p>
              <div className="space-y-3">
                {destinations.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-cream rounded-xl border border-sand">
                    <input className="w-10 text-center text-lg border border-sand rounded-lg p-1 bg-white" value={d.emoji}
                      onChange={e => setDestinations(p => p.map((x, idx) => idx === i ? { ...x, emoji: e.target.value } : x))} />
                    <input className={`${fieldCls} flex-1`} placeholder={`Destination ${i + 1}`} value={d.name}
                      onChange={e => setDestinations(p => p.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                    <input className="w-20 text-sm border border-sand rounded-lg px-2 py-2 bg-white focus:outline-none text-center" type="number" min="1" placeholder="Nuits" value={d.nights}
                      onChange={e => setDestinations(p => p.map((x, idx) => idx === i ? { ...x, nights: e.target.value } : x))} />
                    {destinations.length > 1 && (
                      <button type="button" onClick={() => removeDest(i)} className="text-gray-300 hover:text-coral-500"><Trash2 size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDest}
                className="w-full py-2 border-2 border-dashed border-sand text-sm text-gray-400 hover:border-coral-300 hover:text-coral-500 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Plus size={14} />Ajouter une destination
              </button>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-sand text-sm text-gray-500 rounded-xl hover:bg-cream transition-colors">
                Retour
              </button>
            )}
            <button type="submit"
              className="flex-1 py-2.5 bg-coral-500 text-white text-sm font-semibold rounded-xl hover:bg-coral-600 transition-colors flex items-center justify-center gap-2">
              {step === 1 ? <><ArrowRight size={15} />Suivant</> : <><Plus size={15} />Créer le voyage</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

function ConfirmDeleteModal({ tripTitle, onConfirm, onCancel }: {
  tripTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-body font-semibold text-dark">Supprimer ce voyage ?</h3>
            <p className="text-xs text-gray-400 mt-0.5">« {tripTitle} »</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Cette action est irréversible. Toutes les données du voyage seront définitivement supprimées.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-sand text-sm text-gray-600 rounded-xl hover:bg-cream transition-colors font-medium">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trip Card ─────────────────────────────────────────────────────────────────

function TripCard({ trip, onOpen, onDelete }: { trip: Trip; onOpen: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const start = new Date(trip.startDate);
  const end   = new Date(trip.endDate);
  const days  = differenceInDays(end, start) + 1;
  const totalActivities = trip.days.reduce((s, d) => s + d.activities.length, 0);
  const pendingAlerts = trip.alerts.filter(a => a.status === 'pending').length;

  return (
    <div onClick={onOpen} className="bg-white rounded-2xl border border-sand shadow-warm overflow-hidden hover:shadow-lg hover:border-coral-200 transition-all duration-200 group cursor-pointer">
      {/* Color band */}
      <div className="h-2 bg-hero-gradient" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-dark truncate">{trip.title}</h3>
            {trip.couple && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Heart size={10} className="text-rose-300 fill-current" />
                {trip.couple}
              </p>
            )}
          </div>
          <button onClick={e => { e.stopPropagation(); e.preventDefault(); setConfirmDelete(true); }}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5" title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>

        {/* Destinations */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trip.destinations.map(d => (
            <span key={d.id} className="text-xs px-2 py-0.5 bg-cream border border-sand rounded-full text-gray-600">
              {d.emoji} {d.name}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {format(start, 'd MMM', { locale: fr })} – {format(end, 'd MMM yyyy', { locale: fr })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {days} jours
          </span>
          <span className="flex items-center gap-1">
            <Plane size={11} />
            {trip.destinations.length} destinations
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {totalActivities > 0 && (
              <span className="text-xs px-2 py-0.5 bg-coral-50 border border-coral-100 text-coral-600 rounded-full">
                {totalActivities} activités
              </span>
            )}
            {pendingAlerts > 0 && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">
                {pendingAlerts} à réserver
              </span>
            )}
          </div>
          <button onClick={onOpen}
            className="flex items-center gap-1.5 text-xs font-semibold text-coral-500 hover:text-coral-700 transition-colors group-hover:gap-2">
            Ouvrir <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteModal
          tripTitle={trip.title}
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────

interface HomePageProps {
  trips: Trip[];
  onOpen: (trip: Trip) => void;
  onCreate: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
}

export default function HomePage({ trips, onOpen, onCreate, onDelete }: HomePageProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="relative overflow-hidden grain no-print">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-coral-700 opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-gold-700 opacity-15 blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-2 text-gold-300 text-sm tracking-widest uppercase mb-6">
            <Plane size={14} />
            <span>Travel Planner</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-light text-white tracking-wide mb-3">
            Mes Voyages
          </h1>
          <p className="font-body text-white/60 text-lg mb-8">
            Planifie, organise et vis tes aventures
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-2xl transition-colors shadow-warm"
          >
            <Plus size={18} />
            Nouveau voyage
          </button>
        </div>
      </header>

      {/* Trips grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="font-display text-2xl text-gray-300 mb-2">Aucun voyage pour l'instant</p>
            <p className="text-sm text-gray-400">Crée ton premier voyage pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onOpen={() => onOpen(trip)}
                onDelete={() => onDelete(trip.id)}
              />
            ))}
            {/* Add card */}
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-2xl border-2 border-dashed border-sand hover:border-coral-300 hover:bg-coral-50/30 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 text-gray-400 hover:text-coral-500 min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium">Nouveau voyage</span>
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTripForm
          onCreate={trip => { onCreate(trip); setShowCreate(false); }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
