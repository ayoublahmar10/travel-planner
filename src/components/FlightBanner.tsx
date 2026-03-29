import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plane, Clock, Euro, CheckCircle2, Circle, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { Flight } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);
const fieldCls = 'text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300 w-full';

const fmt = (n: number) => n === 0 ? '' : `${n.toLocaleString('fr-FR')} €`;

// ── Flight Form (add + edit) ──────────────────────────────────────────────────

function FlightForm({ initial, direction, onSave, onClose }: {
  initial?: Flight;
  direction: 'outbound' | 'return';
  onSave: (f: Flight) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    from:          initial?.from          ?? '',
    to:            initial?.to            ?? '',
    date:          initial?.date          ?? '',
    departureTime: initial?.departureTime ?? '',
    arrivalTime:   initial?.arrivalTime   ?? '',
    airline:       initial?.airline       ?? '',
    flightNumber:  initial?.flightNumber  ?? '',
    cost:          initial ? String(initial.cost) : '',
    notes:         initial?.notes         ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id:            initial?.id ?? `flight-${uid()}`,
      direction,
      from:          form.from,
      to:            form.to,
      date:          form.date,
      departureTime: form.departureTime,
      arrivalTime:   form.arrivalTime,
      airline:       form.airline,
      flightNumber:  form.flightNumber,
      cost:          parseFloat(form.cost) || 0,
      booked:        initial?.booked ?? false,
      notes:         form.notes || undefined,
    });
    onClose();
  };

  const color = direction === 'outbound' ? 'border-blue-100 bg-blue-50' : 'border-coral-100 bg-coral-50';
  const btnColor = direction === 'outbound' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-coral-500 hover:bg-coral-600';

  return (
    <form onSubmit={submit} className={`p-4 rounded-2xl border ${color} space-y-3`}>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Aéroport départ</label>
            <input required className={fieldCls} placeholder="Paris (CDG)" value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Aéroport arrivée</label>
            <input required className={fieldCls} placeholder="Bali (DPS)" value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Date</label>
          <input required type="date" className={fieldCls} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Départ</label>
            <input className={fieldCls} placeholder="23:30" value={form.departureTime} onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Arrivée</label>
            <input className={fieldCls} placeholder="19:00" value={form.arrivalTime} onChange={e => setForm(p => ({ ...p, arrivalTime: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Compagnie</label>
          <input className={fieldCls} placeholder="Air France" value={form.airline} onChange={e => setForm(p => ({ ...p, airline: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">N° de vol</label>
          <input className={fieldCls} placeholder="AF555" value={form.flightNumber} onChange={e => setForm(p => ({ ...p, flightNumber: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Coût (€)</label>
          <input type="number" className={fieldCls} placeholder="0" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Notes</label>
          <input className={fieldCls} placeholder="Bagage 23kg inclus…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1"><X size={12} />Annuler</button>
        <button type="submit" className={`text-xs px-4 py-1.5 text-white rounded-lg font-medium flex items-center gap-1 ${btnColor}`}><Check size={12} />Enregistrer</button>
      </div>
    </form>
  );
}

// ── Flight Card ───────────────────────────────────────────────────────────────

function FlightCard({ flight, onUpdate, onDelete, onToggleBooked }: {
  flight: Flight;
  onUpdate: (f: Flight) => void;
  onDelete: (id: string) => void;
  onToggleBooked: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const isOutbound = flight.direction === 'outbound';

  if (editing) {
    return (
      <FlightForm
        initial={flight}
        direction={flight.direction}
        onSave={f => { onUpdate(f); setEditing(false); }}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className={`rounded-2xl border p-4 ${isOutbound ? 'bg-blue-50 border-blue-100' : 'bg-coral-50 border-coral-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOutbound ? 'bg-blue-100' : 'bg-coral-100'}`}>
            <Plane size={18} className={isOutbound ? 'text-blue-500' : 'text-coral-500'} style={{ transform: isOutbound ? 'rotate(45deg)' : 'rotate(-135deg)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-body font-semibold text-sm text-dark flex items-center gap-2 flex-wrap">
              <span>{flight.from}</span>
              <span className={`text-xs ${isOutbound ? 'text-blue-400' : 'text-coral-400'}`}>→</span>
              <span>{flight.to}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
              {flight.date && (
                <span className="flex items-center gap-1">
                  📅 {format(new Date(flight.date + 'T12:00:00'), 'd MMM yyyy', { locale: fr })}
                </span>
              )}
              {flight.departureTime && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />{flight.departureTime} → {flight.arrivalTime}
                </span>
              )}
              {flight.airline && <span className="font-medium text-gray-500">{flight.airline}</span>}
              {flight.flightNumber && <span className="font-mono">{flight.flightNumber}</span>}
              {flight.cost > 0 && (
                <span className="flex items-center gap-1 font-medium text-gold-600">
                  <Euro size={10} />{fmt(flight.cost)}
                </span>
              )}
            </div>
            {flight.notes && <p className="text-xs text-gray-400 italic mt-1">{flight.notes}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleBooked(flight.id)}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border transition-all ${
              flight.booked
                ? 'bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                : 'bg-white border-gray-200 text-gray-400 hover:bg-green-50 hover:border-green-300 hover:text-green-500'
            }`}
          >
            {flight.booked ? <CheckCircle2 size={11} /> : <Circle size={11} />}
            <span className="hidden sm:inline">{flight.booked ? 'Réservé' : 'À réserver'}</span>
          </button>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Modifier"><Pencil size={14} /></button>
          <button onClick={() => onDelete(flight.id)} className="text-gray-400 hover:text-coral-500 transition-colors" title="Supprimer"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ── FlightBanner (section complète) ──────────────────────────────────────────

interface FlightBannerProps {
  flights: Flight[];
  direction: 'outbound' | 'return';
  onAdd:          (f: Flight) => void;
  onUpdate:       (f: Flight) => void;
  onDelete:       (id: string) => void;
  onToggleBooked: (id: string) => void;
}

export default function FlightBanner({ flights, direction, onAdd, onUpdate, onDelete, onToggleBooked }: FlightBannerProps) {
  const [showForm, setShowForm] = useState(false);
  const filtered = flights.filter(f => f.direction === direction);
  const isOutbound = direction === 'outbound';
  const label = isOutbound ? 'Vol aller' : 'Vol retour';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${isOutbound ? 'text-blue-500' : 'text-coral-500'}`}>
          <Plane size={12} style={{ transform: isOutbound ? 'rotate(45deg)' : 'rotate(-135deg)' }} />
          {label}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={`text-xs flex items-center gap-1 transition-colors ${isOutbound ? 'text-blue-400 hover:text-blue-600' : 'text-coral-400 hover:text-coral-600'}`}
        >
          <Plus size={12} />Ajouter
        </button>
      </div>

      {filtered.map(f => (
        <FlightCard
          key={f.id}
          flight={f}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleBooked={onToggleBooked}
        />
      ))}

      {filtered.length === 0 && !showForm && (
        <div className="py-3 text-center text-sm text-gray-300 italic">Aucun vol {isOutbound ? 'aller' : 'retour'} ajouté</div>
      )}

      {showForm && (
        <FlightForm
          direction={direction}
          onSave={f => { onAdd(f); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
