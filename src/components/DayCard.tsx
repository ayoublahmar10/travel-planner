import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Hotel as HotelIcon, Mountain, Zap, Leaf, UtensilsCrossed, Landmark, Waves, Sparkles, ShoppingBag,
  Plane, Ship, Car, Bike, Footprints,
  Clock, Euro, MapPin, Plus, Trash2, GripVertical, CheckCircle2, Circle, Pencil, X, Check, ChevronDown, ChevronUp,
  Coffee, Sun, Moon, Sandwich,
  type LucideIcon,
} from 'lucide-react';
import { DayPlan, Destination, Activity, Restaurant, Transport, Hotel, ActivityType, TransportType, MealType } from '../types';

// ── Icon helpers ──────────────────────────────────────────────────────────────

const activityIcons: Record<ActivityType, LucideIcon> = {
  sightseeing: Mountain, adventure: Zap, relaxation: Leaf, food: UtensilsCrossed,
  culture: Landmark, water: Waves, spa: Sparkles, shopping: ShoppingBag,
};

const activityColors: Record<ActivityType, string> = {
  sightseeing: 'text-blue-500 bg-blue-50',   adventure:  'text-orange-500 bg-orange-50',
  relaxation:  'text-green-500 bg-green-50', food:       'text-amber-500 bg-amber-50',
  culture:     'text-purple-500 bg-purple-50', water:    'text-cyan-500 bg-cyan-50',
  spa:         'text-pink-500 bg-pink-50',   shopping:   'text-rose-500 bg-rose-50',
};

const activityLabels: Record<ActivityType, string> = {
  sightseeing: 'Visite', adventure: 'Aventure', relaxation: 'Détente', food: 'Gastronomie',
  culture: 'Culture', water: 'Nautique', spa: 'Spa', shopping: 'Shopping',
};

const transportIcons: Record<TransportType, LucideIcon> = {
  flight: Plane, ferry: Ship, fastboat: Waves, car: Car, taxi: Car, bike: Bike, walk: Footprints,
};

const transportLabels: Record<TransportType, string> = {
  flight: 'Avion', ferry: 'Ferry', fastboat: 'Bateau rapide',
  car: 'Voiture', taxi: 'Taxi', bike: 'Vélo', walk: 'À pied',
};

const mealIcons: Record<MealType, LucideIcon> = {
  breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Sandwich,
};

const mealLabels: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', dinner: 'Dîner', snack: 'En-cas',
};

const fmt = (n: number) => n === 0 ? 'Gratuit' : `${n.toLocaleString('fr-FR')} €`;
const uid = () => Math.random().toString(36).slice(2, 10);

// ── Shared form field style ───────────────────────────────────────────────────

const fieldCls = 'text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300 w-full';

// ── Activity Item + Edit ──────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: Activity;
  index: number;
  dayId: string;
  onDelete: (dayId: string, id: string) => void;
  onUpdate: (dayId: string, a: Activity) => void;
  onToggleBooked: (dayId: string, id: string) => void;
}

function ActivityItem({ activity, index, dayId, onDelete, onUpdate, onToggleBooked }: ActivityItemProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: activity.name, type: activity.type,
    startTime: activity.startTime, endTime: activity.endTime,
    cost: String(activity.cost), location: activity.location ?? '', notes: activity.notes ?? '',
  });

  const Icon = activityIcons[activity.type] ?? Mountain;
  const colorCls = activityColors[activity.type] ?? 'text-gray-500 bg-gray-50';

  const save = () => {
    onUpdate(dayId, {
      ...activity,
      name: form.name, type: form.type,
      startTime: form.startTime, endTime: form.endTime,
      cost: parseFloat(form.cost) || 0,
      location: form.location, notes: form.notes,
    });
    setEditing(false);
  };

  return (
    <Draggable draggableId={activity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-xl border transition-all duration-150 group ${
            snapshot.isDragging
              ? 'border-coral-300 bg-blush shadow-warm-lg rotate-1 z-50'
              : 'border-sand bg-white hover:border-coral-200 hover:shadow-warm'
          }`}
        >
          {editing ? (
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className={`${fieldCls} col-span-2`} value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nom de l'activité" />
                <select className={fieldCls} value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as ActivityType }))}>
                  {(Object.entries(activityLabels) as [ActivityType, string][]).map(([v, l]) =>
                    <option key={v} value={v}>{l}</option>)}
                </select>
                <input className={fieldCls} type="number" value={form.cost} placeholder="Coût (€)"
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
                <input className={fieldCls} value={form.startTime} placeholder="Début (08:00)"
                  onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                <input className={fieldCls} value={form.endTime} placeholder="Fin (10:00)"
                  onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                <input className={`${fieldCls} col-span-2`} value={form.location} placeholder="Lieu (optionnel)"
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                <textarea className={`${fieldCls} col-span-2 resize-none`} rows={2} value={form.notes} placeholder="Notes (optionnel)"
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1"><X size={12} />Annuler</button>
                <button onClick={save} className="text-xs px-4 py-1.5 bg-coral-500 text-white rounded-lg hover:bg-coral-600 flex items-center gap-1 font-medium"><Check size={12} />Enregistrer</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3">
              <div {...provided.dragHandleProps} className="mt-0.5 text-gray-300 hover:text-coral-400 cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical size={14} />
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-body font-medium text-sm text-dark leading-snug">{activity.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-coral-400 transition-colors" title="Modifier"><Pencil size={13} /></button>
                    <button onClick={() => onDelete(dayId, activity.id)} className="text-gray-400 hover:text-coral-500 transition-colors" title="Supprimer"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                  {activity.startTime && (
                    <span className="flex items-center gap-1"><Clock size={10} />{activity.startTime}–{activity.endTime}</span>
                  )}
                  {activity.location && (
                    <span className="flex items-center gap-1 truncate max-w-[180px]"><MapPin size={10} />{activity.location}</span>
                  )}
                  <span className={`flex items-center gap-1 font-medium ${activity.cost > 0 ? 'text-gold-600' : 'text-green-600'}`}>
                    <Euro size={10} />{fmt(activity.cost)}
                  </span>
                  <button
                    onClick={() => onToggleBooked(dayId, activity.id)}
                    className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full border transition-all ${
                      activity.booked
                        ? 'bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-green-50 hover:border-green-200 hover:text-green-500'
                    }`}
                  >
                    {activity.booked ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                    {activity.booked ? 'Réservé' : 'À réserver'}
                  </button>
                </div>
                {activity.notes && <p className="text-xs text-gray-400 italic mt-1 leading-relaxed">{activity.notes}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// ── Add Activity Form ─────────────────────────────────────────────────────────

function AddActivityForm({ dayId, onAdd, onClose }: {
  dayId: string; onAdd: (dayId: string, a: Activity) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', type: 'sightseeing' as ActivityType, startTime: '', endTime: '', cost: '', location: '', notes: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(dayId, { id: `a-${uid()}`, name: form.name, type: form.type, startTime: form.startTime, endTime: form.endTime, cost: parseFloat(form.cost) || 0, location: form.location, notes: form.notes, booked: false });
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-2 p-3 bg-coral-50 rounded-xl border border-coral-100 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input required className={`${fieldCls} col-span-2`} placeholder="Nom de l'activité" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <select className={fieldCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ActivityType }))}>
          {(Object.entries(activityLabels) as [ActivityType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className={fieldCls} type="number" placeholder="Coût (€)" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
        <input className={fieldCls} placeholder="Début (08:00)" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
        <input className={fieldCls} placeholder="Fin (10:00)" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
        <input className={`${fieldCls} col-span-2`} placeholder="Lieu (optionnel)" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
        <textarea className={`${fieldCls} col-span-2 resize-none`} rows={2} placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark">Annuler</button>
        <button type="submit" className="text-xs px-4 py-1.5 bg-coral-500 text-white rounded-lg hover:bg-coral-600 font-medium">Ajouter</button>
      </div>
    </form>
  );
}

// ── Transport Item + Edit ─────────────────────────────────────────────────────

interface TransportItemProps {
  transport: Transport;
  dayId: string;
  onDelete: (dayId: string, id: string) => void;
  onUpdate: (dayId: string, t: Transport) => void;
  onToggleBooked: (dayId: string, id: string) => void;
}

function TransportItem({ transport: t, dayId, onDelete, onUpdate, onToggleBooked }: TransportItemProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    type: t.type, from: t.from, to: t.to,
    dep: t.departureTime, arr: t.arrivalTime,
    cost: String(t.cost), provider: t.provider ?? '', notes: t.notes ?? '',
  });

  const Icon = transportIcons[t.type] ?? Car;

  const save = () => {
    const dep = form.dep || '00:00';
    const arr = form.arr || '00:00';
    const [dh, dm] = dep.split(':').map(Number);
    const [ah, am] = arr.split(':').map(Number);
    const duration = Math.max(0, (ah * 60 + am) - (dh * 60 + dm));
    onUpdate(dayId, { ...t, type: form.type, from: form.from, to: form.to, departureTime: dep, arrivalTime: arr, duration, cost: parseFloat(form.cost) || 0, provider: form.provider, notes: form.notes });
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-sand bg-forest/5 hover:border-forest/20 transition-colors">
      {editing ? (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select className={fieldCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as TransportType }))}>
              {(Object.entries(transportLabels) as [TransportType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input className={fieldCls} type="number" value={form.cost} placeholder="Coût (€)" onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            <input required className={fieldCls} value={form.from} placeholder="De…" onChange={e => setForm(p => ({ ...p, from: e.target.value }))} />
            <input required className={fieldCls} value={form.to} placeholder="Vers…" onChange={e => setForm(p => ({ ...p, to: e.target.value }))} />
            <input className={fieldCls} value={form.dep} placeholder="Départ (08:00)" onChange={e => setForm(p => ({ ...p, dep: e.target.value }))} />
            <input className={fieldCls} value={form.arr} placeholder="Arrivée (09:30)" onChange={e => setForm(p => ({ ...p, arr: e.target.value }))} />
            <input className={`${fieldCls} col-span-2`} value={form.provider} placeholder="Prestataire (optionnel)" onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} />
            <textarea className={`${fieldCls} col-span-2 resize-none`} rows={2} value={form.notes} placeholder="Notes (optionnel)" onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1"><X size={12} />Annuler</button>
            <button onClick={save} className="text-xs px-4 py-1.5 bg-forest text-white rounded-lg hover:bg-forest/80 flex items-center gap-1 font-medium"><Check size={12} />Enregistrer</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3">
          <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
            <Icon size={14} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body font-medium text-sm text-dark">
                {transportLabels[t.type]} · {t.from} → {t.to}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-forest transition-colors" title="Modifier"><Pencil size={13} /></button>
                <button onClick={() => onDelete(dayId, t.id)} className="text-gray-400 hover:text-coral-500 transition-colors" title="Supprimer"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              {t.departureTime && <span className="flex items-center gap-1"><Clock size={9} />{t.departureTime} → {t.arrivalTime}</span>}
              {t.duration > 0 && <span>{Math.floor(t.duration / 60)}h{t.duration % 60 > 0 ? `${t.duration % 60}min` : ''}</span>}
              {t.provider && <span className="italic">{t.provider}</span>}
              <span className={`font-medium ${t.cost > 0 ? 'text-gold-600' : 'text-green-600'}`}>{fmt(t.cost)}</span>
              <button
                onClick={() => onToggleBooked(dayId, t.id)}
                className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full border transition-all ${
                  t.booked
                    ? 'bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-green-50 hover:border-green-200 hover:text-green-500'
                }`}
              >
                {t.booked ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                {t.booked ? 'Réservé' : 'À réserver'}
              </button>
            </div>
            {t.notes && <p className="text-xs text-gray-400 italic mt-0.5">{t.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Transport Form ────────────────────────────────────────────────────────

function AddTransportForm({ dayId, onAdd, onClose }: {
  dayId: string; onAdd: (dayId: string, t: Transport) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ type: 'car' as TransportType, from: '', to: '', dep: '', arr: '', cost: '', provider: '', notes: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from.trim() || !form.to.trim()) return;
    const dep = form.dep || '00:00'; const arr = form.arr || '00:00';
    const [dh, dm] = dep.split(':').map(Number); const [ah, am] = arr.split(':').map(Number);
    const duration = Math.max(0, (ah * 60 + am) - (dh * 60 + dm));
    onAdd(dayId, { id: `t-${uid()}`, type: form.type, from: form.from, to: form.to, departureTime: dep, arrivalTime: arr, duration, cost: parseFloat(form.cost) || 0, provider: form.provider, notes: form.notes, booked: false });
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-2 p-3 bg-forest/5 rounded-xl border border-forest/10 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select className={fieldCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as TransportType }))}>
          {(Object.entries(transportLabels) as [TransportType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className={fieldCls} type="number" placeholder="Coût (€)" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
        <input required className={fieldCls} placeholder="De…" value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} />
        <input required className={fieldCls} placeholder="Vers…" value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} />
        <input className={fieldCls} placeholder="Départ (08:00)" value={form.dep} onChange={e => setForm(p => ({ ...p, dep: e.target.value }))} />
        <input className={fieldCls} placeholder="Arrivée (09:30)" value={form.arr} onChange={e => setForm(p => ({ ...p, arr: e.target.value }))} />
        <input className={`${fieldCls} col-span-2`} placeholder="Prestataire (optionnel)" value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark">Annuler</button>
        <button type="submit" className="text-xs px-4 py-1.5 bg-forest text-white rounded-lg hover:bg-forest/80 font-medium">Ajouter</button>
      </div>
    </form>
  );
}

// ── Restaurant Item + Edit ────────────────────────────────────────────────────

interface RestaurantItemProps {
  restaurant: Restaurant;
  dayId: string;
  onDelete: (dayId: string, id: string) => void;
  onUpdate: (dayId: string, r: Restaurant) => void;
}

function RestaurantItem({ restaurant: r, dayId, onDelete, onUpdate }: RestaurantItemProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: r.name, meal: r.meal, cost: String(r.estimatedCost), cuisine: r.cuisine ?? '', notes: r.notes ?? '' });

  const Icon = mealIcons[r.meal] ?? Sun;

  const save = () => {
    onUpdate(dayId, { ...r, name: form.name, meal: form.meal, estimatedCost: parseFloat(form.cost) || 0, cuisine: form.cuisine, notes: form.notes });
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-sand bg-amber-50/50 hover:border-gold-200 transition-colors">
      {editing ? (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className={`${fieldCls} col-span-2`} value={form.name} placeholder="Nom du restaurant" onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <select className={fieldCls} value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value as MealType }))}>
              {(Object.entries(mealLabels) as [MealType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input className={fieldCls} type="number" value={form.cost} placeholder="Coût estimé (€)" onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            <input className={`${fieldCls} col-span-2`} value={form.cuisine} placeholder="Cuisine (optionnel)" onChange={e => setForm(p => ({ ...p, cuisine: e.target.value }))} />
            <input className={`${fieldCls} col-span-2`} value={form.notes} placeholder="Notes (optionnel)" onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1"><X size={12} />Annuler</button>
            <button onClick={save} className="text-xs px-4 py-1.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 flex items-center gap-1 font-medium"><Check size={12} />Enregistrer</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3">
          <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
            <Icon size={14} className="text-gold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body font-medium text-sm text-dark">{r.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gold-500 transition-colors" title="Modifier"><Pencil size={13} /></button>
                <button onClick={() => onDelete(dayId, r.id)} className="text-gray-400 hover:text-coral-500 transition-colors" title="Supprimer"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-400">
              <span className="capitalize font-medium text-gold-500">{mealLabels[r.meal]}</span>
              {r.cuisine && <span>{r.cuisine}</span>}
              <span className={`font-medium ${r.estimatedCost > 0 ? 'text-gold-600' : 'text-green-600'}`}>{fmt(r.estimatedCost)}</span>
            </div>
            {r.notes && <p className="text-xs text-gray-400 italic mt-0.5">{r.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Restaurant Form ───────────────────────────────────────────────────────

function AddRestaurantForm({ dayId, onAdd, onClose }: {
  dayId: string; onAdd: (dayId: string, r: Restaurant) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', meal: 'dinner' as MealType, cost: '', cuisine: '', notes: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(dayId, { id: `r-${uid()}`, name: form.name, meal: form.meal, estimatedCost: parseFloat(form.cost) || 0, cuisine: form.cuisine, notes: form.notes });
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input required className={`${fieldCls} col-span-2`} placeholder="Nom du restaurant" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <select className={fieldCls} value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value as MealType }))}>
          {(Object.entries(mealLabels) as [MealType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className={fieldCls} type="number" placeholder="Coût estimé (€)" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
        <input className={`${fieldCls} col-span-2`} placeholder="Cuisine (optionnel)" value={form.cuisine} onChange={e => setForm(p => ({ ...p, cuisine: e.target.value }))} />
        <input className={`${fieldCls} col-span-2`} placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark">Annuler</button>
        <button type="submit" className="text-xs px-4 py-1.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium">Ajouter</button>
      </div>
    </form>
  );
}

// ── DayCard ───────────────────────────────────────────────────────────────────

interface DayCardProps {
  day: DayPlan;
  dayNumber: number;
  destination?: Destination;
  isFirstOfDestination: boolean;
  isToday?: boolean;
  onUpdateHotel:      (destId: string, h: Hotel)      => void;
  onAddActivity:      (dayId: string, a: Activity)    => void;
  onUpdateActivity:   (dayId: string, a: Activity)    => void;
  onDeleteActivity:   (dayId: string, id: string)     => void;
  onToggleActivityBooked: (dayId: string, id: string) => void;
  onAddRestaurant:    (dayId: string, r: Restaurant)  => void;
  onUpdateRestaurant: (dayId: string, r: Restaurant)  => void;
  onDeleteRestaurant: (dayId: string, id: string)     => void;
  onAddTransport:     (dayId: string, t: Transport)   => void;
  onUpdateTransport:  (dayId: string, t: Transport)   => void;
  onDeleteTransport:  (dayId: string, id: string)     => void;
  onToggleTransportBooked: (dayId: string, id: string) => void;
}

export default function DayCard({
  day, dayNumber, destination, isFirstOfDestination, isToday = false,
  onUpdateHotel,
  onAddActivity, onUpdateActivity, onDeleteActivity, onToggleActivityBooked,
  onAddRestaurant, onUpdateRestaurant, onDeleteRestaurant,
  onAddTransport, onUpdateTransport, onDeleteTransport, onToggleTransportBooked,
}: DayCardProps) {
  const [showAddActivity,   setShowAddActivity]   = useState(false);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddTransport,  setShowAddTransport]  = useState(false);
  const [editingHotel,      setEditingHotel]      = useState(false);
  const [hotelForm, setHotelForm] = useState<Hotel | null>(null);
  // Sur mobile, les sections sont ouvertes si c'est aujourd'hui, fermées sinon
  const [expanded, setExpanded] = useState(isToday);

  const dateObj = new Date(day.date + 'T12:00:00');
  const dayTotal =
    day.activities.reduce((s, a) => s + a.cost, 0) +
    day.restaurants.reduce((s, r) => s + r.estimatedCost, 0) +
    day.transports.reduce((s, t) => s + t.cost, 0);
  const totalTransportTime = day.transports.reduce((s, t) => s + t.duration, 0);

  const bookedCount = day.activities.filter(a => a.booked).length + day.transports.filter(t => t.booked).length;
  const totalBookable = day.activities.length + day.transports.length;

  return (
    <div className={`bg-white rounded-2xl border shadow-warm overflow-hidden animate-slide-up print-break ${isToday ? 'border-coral-300 ring-2 ring-coral-100' : 'border-sand'}`}>
      {/* Day header — cliquable sur mobile pour replier */}
      <button
        className="w-full text-left relative px-4 sm:px-6 py-3 sm:py-4 bg-card-gradient border-b border-sand sm:cursor-default"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-body font-semibold text-coral-400 uppercase tracking-widest">
                Jour {dayNumber}
              </span>
              {isToday && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-coral-500 text-white rounded-full">Aujourd'hui</span>
              )}
              {destination && !isToday && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{destination.emoji} {destination.name}</span>
                </>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-dark capitalize truncate">
              {format(dateObj, 'EEEE d MMMM', { locale: fr })}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right space-y-0.5">
              {dayTotal > 0 && (
                <div className="text-sm font-semibold text-gold-600">{dayTotal.toLocaleString('fr-FR')} €</div>
              )}
              {totalBookable > 0 && (
                <div className={`text-xs flex items-center gap-1 justify-end font-medium ${bookedCount === totalBookable ? 'text-green-500' : 'text-amber-500'}`}>
                  <CheckCircle2 size={10} />
                  {bookedCount}/{totalBookable}
                </div>
              )}
            </div>
            {/* Chevron visible uniquement sur mobile */}
            <div className="sm:hidden text-gray-400">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </button>

      {/* Contenu — toujours visible sur desktop, repliable sur mobile */}
      <div className={`${expanded ? 'block' : 'hidden'} sm:block`}>
      <div className="p-4 sm:p-5 space-y-5">

        {/* Hébergement */}
        {isFirstOfDestination && destination && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-body font-semibold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
                <HotelIcon size={11} />
                Hébergement
              </h3>
              <div className="flex items-center gap-2">
                {isToday && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full border border-gold-200">
                    Check-in aujourd'hui
                  </span>
                )}
                <button
                  onClick={() => { setHotelForm(destination.hotel); setEditingHotel(true); }}
                  className="text-gray-400 hover:text-gold-500 transition-colors"
                  title="Modifier l'hébergement"
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>

            {editingHotel && hotelForm ? (
              <div className="p-3 bg-gold-50 rounded-xl border border-gold-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className={`${fieldCls} col-span-2`} placeholder="Nom de l'hôtel" value={hotelForm.name}
                    onChange={e => setHotelForm(p => p && ({ ...p, name: e.target.value }))} />
                  <input className={`${fieldCls} col-span-2`} placeholder="Adresse" value={hotelForm.address}
                    onChange={e => setHotelForm(p => p && ({ ...p, address: e.target.value }))} />
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Check-in</label>
                      <input type="date" className={fieldCls} value={hotelForm.checkIn}
                        onChange={e => setHotelForm(p => p && ({ ...p, checkIn: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Check-out</label>
                      <input type="date" className={fieldCls} value={hotelForm.checkOut}
                        onChange={e => setHotelForm(p => p && ({ ...p, checkOut: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Prix/nuit (€)</label>
                    <input type="number" className={fieldCls} value={hotelForm.costPerNight}
                      onChange={e => setHotelForm(p => p && ({ ...p, costPerNight: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nuits</label>
                    <input type="number" className={fieldCls} value={hotelForm.nights}
                      onChange={e => setHotelForm(p => p && ({ ...p, nights: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <textarea className={`${fieldCls} col-span-2 resize-none`} rows={2} placeholder="Notes (optionnel)" value={hotelForm.notes ?? ''}
                    onChange={e => setHotelForm(p => p && ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingHotel(false)} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1">
                    <X size={12} />Annuler
                  </button>
                  <button
                    onClick={() => { onUpdateHotel(destination.id, hotelForm); setEditingHotel(false); }}
                    className="text-xs px-4 py-1.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 flex items-center gap-1 font-medium"
                  >
                    <Check size={12} />Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-gold-50 rounded-xl border border-gold-100">
                <div className="w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                  <HotelIcon size={16} className="text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold text-sm text-dark">{destination.hotel.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{destination.hotel.address}</div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      Check-in {format(new Date(destination.hotel.checkIn + 'T12:00:00'), 'd MMM', { locale: fr })}
                      {' → '}
                      Check-out {format(new Date(destination.hotel.checkOut + 'T12:00:00'), 'd MMM', { locale: fr })}
                    </span>
                    <span className="flex items-center gap-1 text-gold-600 font-medium">
                      <Euro size={9} />
                      {destination.hotel.costPerNight}€/nuit · {destination.hotel.nights} nuits = {destination.hotel.costPerNight * destination.hotel.nights} €
                    </span>
                  </div>
                  {destination.hotel.notes && (
                    <p className="text-xs text-gold-600 italic mt-1">{destination.hotel.notes}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Transports */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-body font-semibold text-forest uppercase tracking-widest flex items-center gap-1.5">
              <Car size={11} />
              Transports
            </h3>
            <button onClick={() => setShowAddTransport(true)} className="text-xs text-forest/60 hover:text-forest flex items-center gap-1 transition-colors">
              <Plus size={12} />Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {day.transports.map(t => (
              <TransportItem
                key={t.id}
                transport={t}
                dayId={day.id}
                onDelete={onDeleteTransport}
                onUpdate={onUpdateTransport}
                onToggleBooked={onToggleTransportBooked}
              />
            ))}
            {day.transports.length === 0 && !showAddTransport && (
              <div className="py-3 text-center text-sm text-gray-300 italic">Aucun transport planifié</div>
            )}
            {showAddTransport && (
              <AddTransportForm dayId={day.id} onAdd={onAddTransport} onClose={() => setShowAddTransport(false)} />
            )}
          </div>
        </section>

        {/* Activités */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-body font-semibold text-coral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={11} />
              Activités
            </h3>
            <button onClick={() => setShowAddActivity(true)} className="text-xs text-coral-400 hover:text-coral-600 flex items-center gap-1 transition-colors">
              <Plus size={12} />Ajouter
            </button>
          </div>

          <Droppable droppableId={day.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[2px]">
                {day.activities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    dayId={day.id}
                    onDelete={onDeleteActivity}
                    onUpdate={onUpdateActivity}
                    onToggleBooked={onToggleActivityBooked}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {day.activities.length === 0 && !showAddActivity && (
            <div className="py-4 text-center text-sm text-gray-300 italic">Aucune activité — cliquez sur Ajouter</div>
          )}
          {showAddActivity && (
            <AddActivityForm dayId={day.id} onAdd={onAddActivity} onClose={() => setShowAddActivity(false)} />
          )}
        </section>

        {/* Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-body font-semibold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
              <UtensilsCrossed size={11} />
              Restaurants
            </h3>
            <button onClick={() => setShowAddRestaurant(true)} className="text-xs text-gold-500 hover:text-gold-700 flex items-center gap-1 transition-colors">
              <Plus size={12} />Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {day.restaurants.map(r => (
              <RestaurantItem
                key={r.id}
                restaurant={r}
                dayId={day.id}
                onDelete={onDeleteRestaurant}
                onUpdate={onUpdateRestaurant}
              />
            ))}
            {day.restaurants.length === 0 && !showAddRestaurant && (
              <div className="py-3 text-center text-sm text-gray-300 italic">Aucun restaurant planifié</div>
            )}
            {showAddRestaurant && (
              <AddRestaurantForm dayId={day.id} onAdd={onAddRestaurant} onClose={() => setShowAddRestaurant(false)} />
            )}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
