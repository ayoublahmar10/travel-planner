import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle, AlertCircle, Info,
  Hotel, Star, MapPin, FileText, Bell,
  CheckCircle2, Circle, CheckCheck,
  Trash2, Plus,
  type LucideIcon,
} from 'lucide-react';
import { Alert, AlertStatus, AlertPriority, AlertCategory, Trip } from '../types';

interface AlertsPanelProps {
  trip: Trip;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (alert: Alert) => void;
}

const priorityConfig: Record<AlertPriority, { icon: LucideIcon; cls: string; label: string }> = {
  high:   { icon: AlertTriangle, cls: 'text-red-500 bg-red-50 border-red-200',       label: 'Urgent' },
  medium: { icon: AlertCircle,   cls: 'text-amber-500 bg-amber-50 border-amber-200', label: 'Important' },
  low:    { icon: Info,          cls: 'text-blue-500 bg-blue-50 border-blue-200',    label: 'Info' },
};

const categoryConfig: Record<AlertCategory, { icon: LucideIcon; label: string }> = {
  hotel:     { icon: Hotel,    label: 'Hôtel' },
  activity:  { icon: Star,     label: 'Activité' },
  transport: { icon: MapPin,   label: 'Transport' },
  document:  { icon: FileText, label: 'Document' },
  other:     { icon: Bell,     label: 'Autre' },
};

const statusConfig: Record<AlertStatus, { icon: LucideIcon; cls: string; label: string }> = {
  pending:   { icon: Circle,       cls: 'text-gray-400',  label: 'À faire' },
  booked:    { icon: CheckCircle2, cls: 'text-amber-500', label: 'Réservé' },
  confirmed: { icon: CheckCheck,   cls: 'text-green-500', label: 'Confirmé' },
};

const uid = () => Math.random().toString(36).slice(2, 10);

function AddAlertForm({ onAdd, onClose }: { onAdd: (a: Alert) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', priority: 'medium' as AlertPriority,
    category: 'activity' as AlertCategory,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      id: `alert-${uid()}`,
      title: form.title, description: form.description,
      dueDate: form.dueDate, priority: form.priority, category: form.category,
      status: 'pending',
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="p-4 bg-coral-50 rounded-2xl border border-coral-100 space-y-3">
      <h4 className="font-body font-semibold text-sm text-dark">Nouvelle alerte</h4>
      <div className="space-y-2">
        <input required placeholder="Titre de l'alerte" value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300"
        />
        <textarea placeholder="Description (optionnel)" value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={2}
          className="w-full text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300 resize-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <input type="date" value={form.dueDate}
            onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
            className="text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300"
          />
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as AlertPriority }))}
            className="text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300">
            <option value="high">Urgent</option>
            <option value="medium">Important</option>
            <option value="low">Info</option>
          </select>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as AlertCategory }))}
            className="text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300">
            <option value="hotel">Hôtel</option>
            <option value="activity">Activité</option>
            <option value="transport">Transport</option>
            <option value="document">Document</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark transition-colors">Annuler</button>
        <button type="submit" className="text-xs px-4 py-1.5 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors font-medium">Créer</button>
      </div>
    </form>
  );
}

function AlertCard({ alert, onToggle, onDelete }: { alert: Alert; onToggle: () => void; onDelete: () => void }) {
  const pConf = priorityConfig[alert.priority];
  const cConf = categoryConfig[alert.category];
  const sConf = statusConfig[alert.status];
  const PIcon = pConf.icon;
  const CIcon = cConf.icon;
  const SIcon = sConf.icon;

  const isOverdue = alert.dueDate && new Date(alert.dueDate) < new Date() && alert.status === 'pending';

  return (
    <div className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 group ${
      alert.status === 'confirmed'
        ? 'bg-green-50 border-green-100 opacity-70'
        : `bg-white border-sand hover:border-${alert.priority === 'high' ? 'coral' : 'gold'}-200 hover:shadow-warm`
    }`}>
      {/* Priority indicator */}
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${pConf.cls}`}>
        <PIcon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <span className={`font-body font-semibold text-sm leading-snug flex-1 ${
            alert.status === 'confirmed' ? 'line-through text-gray-400' : 'text-dark'
          }`}>
            {alert.title}
          </span>
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-200 hover:text-coral-500 shrink-0 mt-0.5">
            <Trash2 size={13} />
          </button>
        </div>

        {/* Description */}
        {alert.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.description}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {/* Category */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <CIcon size={10} />
            {cConf.label}
          </span>

          {/* Due date */}
          {alert.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'
            }`}>
              📅 Avant le {format(new Date(alert.dueDate + 'T12:00:00'), 'd MMM yyyy', { locale: fr })}
              {isOverdue && ' ⚠️'}
            </span>
          )}

          {/* Status toggle */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-all ${
              alert.status === 'pending'
                ? 'bg-gray-50 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500'
                : alert.status === 'booked'
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:border-green-300 hover:text-green-600'
                : 'bg-green-50 border-green-200 text-green-600'
            }`}
          >
            <SIcon size={10} />
            {sConf.label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPanel({ trip, onToggleStatus, onDelete, onAdd }: AlertsPanelProps) {
  const [showAdd, setShowAdd] = useState(false);

  const pending   = trip.alerts.filter(a => a.status === 'pending');
  const booked    = trip.alerts.filter(a => a.status === 'booked');
  const confirmed = trip.alerts.filter(a => a.status === 'confirmed');

  const highPriority = pending.filter(a => a.priority === 'high');
  const otherPending = pending.filter(a => a.priority !== 'high');

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'À faire',   count: pending.length,   color: 'bg-red-50   border-red-200   text-red-600',   dot: 'bg-red-400' },
          { label: 'Réservé',   count: booked.length,    color: 'bg-amber-50 border-amber-200 text-amber-600', dot: 'bg-amber-400' },
          { label: 'Confirmé',  count: confirmed.length, color: 'bg-green-50 border-green-200 text-green-600', dot: 'bg-green-400' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.color}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
            <div>
              <div className="text-2xl font-display font-semibold leading-none">{s.count}</div>
              <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white text-sm rounded-xl hover:bg-coral-600 transition-colors font-medium shadow-warm"
        >
          <Plus size={14} />
          Nouvelle alerte
        </button>
      </div>

      {showAdd && <AddAlertForm onAdd={alert => { onAdd(alert); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}

      {/* High priority section */}
      {highPriority.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <h3 className="font-body font-semibold text-sm text-red-600 uppercase tracking-widest">Urgent — À faire immédiatement</h3>
          </div>
          <div className="space-y-2">
            {highPriority.map(a => (
              <AlertCard key={a.id} alert={a} onToggle={() => onToggleStatus(a.id)} onDelete={() => onDelete(a.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Other pending */}
      {otherPending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-amber-500" />
            <h3 className="font-body font-semibold text-sm text-amber-600 uppercase tracking-widest">À planifier</h3>
          </div>
          <div className="space-y-2">
            {otherPending.map(a => (
              <AlertCard key={a.id} alert={a} onToggle={() => onToggleStatus(a.id)} onDelete={() => onDelete(a.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Booked */}
      {booked.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-amber-500" />
            <h3 className="font-body font-semibold text-sm text-amber-600 uppercase tracking-widest">Réservé — En attente de confirmation</h3>
          </div>
          <div className="space-y-2">
            {booked.map(a => (
              <AlertCard key={a.id} alert={a} onToggle={() => onToggleStatus(a.id)} onDelete={() => onDelete(a.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCheck size={14} className="text-green-500" />
            <h3 className="font-body font-semibold text-sm text-green-600 uppercase tracking-widest">Confirmé ✓</h3>
          </div>
          <div className="space-y-2">
            {confirmed.map(a => (
              <AlertCard key={a.id} alert={a} onToggle={() => onToggleStatus(a.id)} onDelete={() => onDelete(a.id)} />
            ))}
          </div>
        </section>
      )}

      {trip.alerts.length === 0 && (
        <div className="py-16 text-center">
          <Bell size={32} className="text-sand mx-auto mb-3" />
          <p className="text-gray-400 font-body">Aucune alerte configurée</p>
        </div>
      )}
    </div>
  );
}
