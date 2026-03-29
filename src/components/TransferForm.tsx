import { useState } from 'react';
import { Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import {
  Transfer, TransferSegment, TransferSegmentType,
  BookingStatus, TransferDifficulty, Destination,
} from '../types';
import { formatDuration } from '../utils/transfer';

const uid = () => Math.random().toString(36).slice(2, 10);
const fieldCls = 'text-sm border border-sand rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-coral-300 w-full';
const labelCls = 'text-xs text-gray-400 mb-1 block';

// ── Static options ────────────────────────────────────────────────────────────

const SEGMENT_TYPES: { value: TransferSegmentType; label: string }[] = [
  { value: 'taxi',        label: 'Taxi' },
  { value: 'private_car', label: 'Voiture privée' },
  { value: 'fastboat',    label: 'Fast boat' },
  { value: 'ferry',       label: 'Ferry' },
  { value: 'walk',        label: 'À pied' },
  { value: 'bus',         label: 'Bus' },
  { value: 'motorbike',   label: 'Moto-taxi' },
  { value: 'buffer',      label: 'Attente / buffer' },
];

const BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: 'pending',   label: 'À réserver' },
  { value: 'booked',    label: 'Réservé' },
  { value: 'confirmed', label: 'Confirmé' },
];

const DIFFICULTIES: { value: TransferDifficulty | ''; label: string }[] = [
  { value: '',            label: 'Auto (calculée)' },
  { value: 'easy',        label: 'Facile' },
  { value: 'moderate',    label: 'Modéré' },
  { value: 'challenging', label: 'Complexe' },
];

// ── TransferSegmentForm ───────────────────────────────────────────────────────

interface SegFormState {
  type: TransferSegmentType;
  from: string;
  to: string;
  durationMinutes: string;
  cost: string;
  bookingStatus: BookingStatus;
  provider: string;
  notes: string;
}

function initSeg(s?: TransferSegment): SegFormState {
  return {
    type:            s?.type            ?? 'taxi',
    from:            s?.from            ?? '',
    to:              s?.isBuffer        ? '' : (s?.to ?? ''),
    durationMinutes: s ? String(s.durationMinutes) : '',
    cost:            s ? String(s.cost) : '',
    bookingStatus:   s?.bookingStatus   ?? 'pending',
    provider:        s?.provider        ?? '',
    notes:           s?.notes           ?? '',
  };
}

function TransferSegmentForm({ initial, onSave, onClose }: {
  initial?: TransferSegment;
  onSave: (s: TransferSegment) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SegFormState>(initSeg(initial));
  const isBuffer = form.type === 'buffer';

  const set = <K extends keyof SegFormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id:             initial?.id ?? `seg-${uid()}`,
      type:           form.type,
      from:           form.from,
      to:             isBuffer ? form.from : form.to,
      durationMinutes: parseInt(form.durationMinutes) || 0,
      cost:           isBuffer ? 0 : parseFloat(form.cost) || 0,
      isBuffer,
      bookingStatus:  form.bookingStatus,
      provider:       form.provider || undefined,
      notes:          form.notes    || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="p-3 rounded-xl border border-sand bg-cream/50 space-y-3">
      {/* Type */}
      <div>
        <label className={labelCls}>Type</label>
        <select required className={fieldCls} value={form.type} onChange={set('type')}>
          {SEGMENT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* From / To — buffer shows single location field */}
      {isBuffer ? (
        <div>
          <label className={labelCls}>Lieu d'attente</label>
          <input className={fieldCls} placeholder="Port de Sanur" value={form.from} onChange={set('from')} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Départ</label>
            <input required className={fieldCls} placeholder="Hôtel Ubud" value={form.from} onChange={set('from')} />
          </div>
          <div>
            <label className={labelCls}>Arrivée</label>
            <input required className={fieldCls} placeholder="Port Sanur" value={form.to} onChange={set('to')} />
          </div>
        </div>
      )}

      {/* Duration + Cost */}
      <div className={`grid gap-2 ${isBuffer ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className={labelCls}>Durée (minutes)</label>
          <input required type="number" min="1" className={fieldCls} placeholder="60"
            value={form.durationMinutes} onChange={set('durationMinutes')} />
        </div>
        {!isBuffer && (
          <div>
            <label className={labelCls}>Coût (€)</label>
            <input type="number" min="0" className={fieldCls} placeholder="0"
              value={form.cost} onChange={set('cost')} />
          </div>
        )}
      </div>

      {/* Booking status — hidden for buffers */}
      {!isBuffer && (
        <div>
          <label className={labelCls}>Statut réservation</label>
          <select className={fieldCls} value={form.bookingStatus} onChange={set('bookingStatus')}>
            {BOOKING_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Provider + Notes */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Prestataire</label>
          <input className={fieldCls} placeholder="Rocky Fast Cruise…" value={form.provider} onChange={set('provider')} />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <input className={fieldCls} placeholder="Remarque…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose}
          className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1">
          <X size={12} />Annuler
        </button>
        <button type="submit"
          className="text-xs px-4 py-1.5 text-white bg-coral-500 hover:bg-coral-600 rounded-lg font-medium flex items-center gap-1">
          <Check size={12} />{initial ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

// ── SegmentRow ────────────────────────────────────────────────────────────────

function SegmentRow({ segment, onEdit, onDelete }: {
  segment: TransferSegment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeLabel = SEGMENT_TYPES.find(t => t.value === segment.type)?.label ?? segment.type;
  const statusLabel = BOOKING_STATUSES.find(s => s.value === segment.bookingStatus)?.label;

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${
      segment.isBuffer
        ? 'bg-gray-50 border border-dashed border-gray-200'
        : 'bg-white border border-sand'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-dark">{typeLabel}</div>
        {!segment.isBuffer && (
          <div className="text-[11px] text-gray-400 truncate">
            {segment.from} → {segment.to}
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 mt-0.5">
          <span>{formatDuration(segment.durationMinutes)}</span>
          {segment.cost > 0 && <span>{segment.cost} €</span>}
          {!segment.isBuffer && statusLabel && (
            <span className={
              segment.bookingStatus === 'confirmed' ? 'text-green-600' :
              segment.bookingStatus === 'booked'    ? 'text-blue-600'  : 'text-gray-400'
            }>
              {statusLabel}
            </span>
          )}
          {segment.provider && <span className="italic">{segment.provider}</span>}
        </div>
      </div>
      <div className="flex gap-0.5 shrink-0">
        <button type="button" onClick={onEdit}
          className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
          <Pencil size={13} />
        </button>
        <button type="button" onClick={onDelete}
          className="p-1.5 text-gray-300 hover:text-coral-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── TransferForm ──────────────────────────────────────────────────────────────

interface TransferFormState {
  fromDestinationId: string;
  toDestinationId: string;
  date: string;
  departureTime: string;
  difficulty: TransferDifficulty | '';
  notes: string;
}

function initTransfer(t?: Transfer, destinations?: Destination[]): TransferFormState {
  return {
    fromDestinationId: t?.fromDestinationId ?? destinations?.[0]?.id ?? '',
    toDestinationId:   t?.toDestinationId   ?? destinations?.[1]?.id ?? '',
    date:              t?.date              ?? '',
    departureTime:     t?.departureTime     ?? '',
    difficulty:        t?.difficulty        ?? '',
    notes:             t?.notes             ?? '',
  };
}

export interface TransferFormProps {
  initial?: Transfer;
  destinations: Destination[];
  onSave: (t: Transfer) => void;
  onClose: () => void;
}

export function TransferForm({ initial, destinations, onSave, onClose }: TransferFormProps) {
  const [form, setForm] = useState<TransferFormState>(() => initTransfer(initial, destinations));
  const [segments, setSegments] = useState<TransferSegment[]>(initial?.segments ?? []);
  const [editingSegId, setEditingSegId] = useState<string | null>(null);
  const [addingSegment, setAddingSegment] = useState(false);

  const set = <K extends keyof TransferFormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleAddSegment = (seg: TransferSegment) => {
    setSegments(prev => [...prev, seg]);
    setAddingSegment(false);
  };

  const handleUpdateSegment = (seg: TransferSegment) => {
    setSegments(prev => prev.map(s => s.id === seg.id ? seg : s));
    setEditingSegId(null);
  };

  const handleDeleteSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    if (editingSegId === id) setEditingSegId(null);
  };

  const startEditSeg = (id: string) => {
    setEditingSegId(id);
    setAddingSegment(false);
  };

  const startAddSeg = () => {
    setEditingSegId(null);
    setAddingSegment(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.fromDestinationId === form.toDestinationId) return;
    onSave({
      id:                initial?.id ?? `transfer-${uid()}`,
      fromDestinationId: form.fromDestinationId,
      toDestinationId:   form.toDestinationId,
      date:              form.date,
      departureTime:     form.departureTime,
      segments,
      difficulty:        (form.difficulty as TransferDifficulty) || undefined,
      notes:             form.notes || undefined,
    });
    onClose();
  };

  const canAddSeg = editingSegId === null && !addingSegment;

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-sand shadow-warm p-4 space-y-4">
      <p className="font-body font-semibold text-sm text-dark">
        {initial ? 'Modifier le transfert' : 'Nouveau transfert'}
      </p>

      {/* ── Route ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>De</label>
          <select required className={fieldCls} value={form.fromDestinationId} onChange={set('fromDestinationId')}>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Vers</label>
          <select required className={fieldCls} value={form.toDestinationId} onChange={set('toDestinationId')}>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
            ))}
          </select>
        </div>
        {form.fromDestinationId === form.toDestinationId && (
          <p className="col-span-2 text-xs text-coral-500">
            La destination de départ et d'arrivée doivent être différentes.
          </p>
        )}
      </div>

      {/* ── Date + time ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date</label>
          <input required type="date" className={fieldCls} value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className={labelCls}>Heure de départ</label>
          <input type="time" className={fieldCls} value={form.departureTime} onChange={set('departureTime')} />
        </div>
      </div>

      {/* ── Difficulty + notes ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Difficulté</label>
          <select className={fieldCls} value={form.difficulty} onChange={set('difficulty')}>
            {DIFFICULTIES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <input className={fieldCls} placeholder="Conseils généraux…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>

      {/* ── Segments ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Segments {segments.length > 0 && `(${segments.length})`}
          </span>
          {canAddSeg && (
            <button type="button" onClick={startAddSeg}
              className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1 font-medium">
              <Plus size={12} />Ajouter
            </button>
          )}
        </div>

        <div className="space-y-2">
          {segments.map(seg =>
            editingSegId === seg.id ? (
              <TransferSegmentForm
                key={seg.id}
                initial={seg}
                onSave={handleUpdateSegment}
                onClose={() => setEditingSegId(null)}
              />
            ) : (
              <SegmentRow
                key={seg.id}
                segment={seg}
                onEdit={() => startEditSeg(seg.id)}
                onDelete={() => handleDeleteSegment(seg.id)}
              />
            )
          )}

          {addingSegment && (
            <TransferSegmentForm
              onSave={handleAddSegment}
              onClose={() => setAddingSegment(false)}
            />
          )}

          {segments.length === 0 && !addingSegment && (
            <div className="py-4 text-center text-xs text-gray-300 italic border border-dashed border-gray-200 rounded-xl">
              Aucun segment — cliquez sur Ajouter pour commencer
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 justify-end pt-2 border-t border-sand">
        <button type="button" onClick={onClose}
          className="text-xs px-3 py-1.5 text-gray-500 hover:text-dark flex items-center gap-1">
          <X size={12} />Annuler
        </button>
        <button type="submit"
          disabled={form.fromDestinationId === form.toDestinationId}
          className="text-xs px-4 py-1.5 text-white bg-coral-500 hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-1">
          <Check size={12} />Enregistrer
        </button>
      </div>
    </form>
  );
}
