import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Car, Waves, Footprints, Bus, Bike, Clock, Timer,
  Euro, AlertTriangle, CheckCircle2, Circle, Check,
  ChevronDown, ChevronUp, Pencil, Trash2, Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Transfer, TransferSegment, TransferSegmentType, TransferDifficulty, Destination } from '../types';
import {
  getDifficulty, getTotalDuration, getTotalCost,
  getEstimatedArrival, getBookingProgress, formatDuration,
  getTransferTips,
} from '../utils/transfer';
import { TransferForm } from './TransferForm';

// ── Static config ─────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<TransferSegmentType, string> = {
  taxi:        'Taxi',
  private_car: 'Voiture privée',
  fastboat:    'Fast boat',
  ferry:       'Ferry',
  walk:        'À pied',
  bus:         'Bus',
  motorbike:   'Moto-taxi',
  buffer:      'Attente',
};

const TYPE_ICON: Record<TransferSegmentType, LucideIcon> = {
  taxi:        Car,
  private_car: Car,
  fastboat:    Waves,
  ferry:       Waves,
  walk:        Footprints,
  bus:         Bus,
  motorbike:   Bike,
  buffer:      Clock,
};

// text + bg applied to the type badge
const TYPE_COLOR: Record<TransferSegmentType, string> = {
  taxi:        'text-blue-600 bg-blue-50',
  private_car: 'text-indigo-600 bg-indigo-50',
  fastboat:    'text-teal-600 bg-teal-50',
  ferry:       'text-cyan-600 bg-cyan-50',
  walk:        'text-green-600 bg-green-50',
  bus:         'text-purple-600 bg-purple-50',
  motorbike:   'text-orange-600 bg-orange-50',
  buffer:      'text-gray-400 bg-gray-50',
};

// dot color in the timeline
const TYPE_DOT: Record<TransferSegmentType, string> = {
  taxi:        'bg-blue-400',
  private_car: 'bg-indigo-400',
  fastboat:    'bg-teal-400',
  ferry:       'bg-cyan-400',
  walk:        'bg-green-400',
  bus:         'bg-purple-400',
  motorbike:   'bg-orange-400',
  buffer:      'bg-gray-300',
};

const DIFFICULTY: Record<TransferDifficulty, { label: string; badge: string }> = {
  easy:        { label: 'Facile',   badge: 'bg-green-50 text-green-700 border-green-200' },
  moderate:    { label: 'Modéré',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  challenging: { label: 'Complexe', badge: 'bg-red-50   text-red-700   border-red-200'   },
};

const STATUS = {
  pending:   { label: 'À réserver', cls: 'text-gray-500  bg-gray-50  border-gray-200',  Icon: Circle       },
  booked:    { label: 'Réservé',    cls: 'text-blue-600  bg-blue-50  border-blue-200',   Icon: CheckCircle2 },
  confirmed: { label: 'Confirmé',   cls: 'text-green-600 bg-green-50 border-green-200',  Icon: Check        },
} as const;

// ── Helper ────────────────────────────────────────────────────────────────────

function addMin(time: string, min: number): string {
  const [h, m] = time.split(':').map(Number);
  const t = h * 60 + m + min;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

// ── TransferSegmentItem ───────────────────────────────────────────────────────

function TransferSegmentItem({ segment, startTime, isLast }: {
  segment: TransferSegment;
  startTime: string;
  isLast: boolean;
}) {
  const Icon = TYPE_ICON[segment.type];
  const { Icon: StatusIcon, cls: statusCls, label: statusLabel } = STATUS[segment.bookingStatus];

  return (
    <div className="flex gap-3 min-w-0">

      {/* Timeline column */}
      <div className="flex flex-col items-center w-11 shrink-0">
        <span className="text-[10px] font-mono text-gray-400 leading-none tabular-nums">{startTime}</span>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${segment.isBuffer ? 'bg-gray-300' : TYPE_DOT[segment.type]}`} />
        {!isLast && (
          <div className={`w-px flex-1 mt-1 min-h-[28px] ${segment.isBuffer ? 'border-l-2 border-dashed border-gray-200' : 'bg-gray-100'}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3.5">

        {/* Type badge + meta chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[segment.type]}`}>
            <Icon size={10} />
            {TYPE_LABEL[segment.type]}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <Timer size={9} />
            {formatDuration(segment.durationMinutes)}
          </span>
          {segment.cost > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gold-600">
              <Euro size={9} />{segment.cost.toLocaleString('fr-FR')}
            </span>
          )}
          {!segment.isBuffer && (
            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${statusCls}`}>
              <StatusIcon size={9} />
              <span className="hidden sm:inline">{statusLabel}</span>
            </span>
          )}
        </div>

        {/* Route */}
        {!segment.isBuffer && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-600">
            <span className="font-medium truncate">{segment.from}</span>
            <span className="text-gray-300 shrink-0">→</span>
            <span className="font-medium truncate">{segment.to}</span>
          </div>
        )}

        {segment.provider && (
          <p className="text-[10px] text-gray-400 mt-0.5">{segment.provider}</p>
        )}
        {segment.notes && (
          <p className="text-[10px] text-gray-400 italic mt-0.5 leading-snug">{segment.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── TransferTimeline ──────────────────────────────────────────────────────────

export function TransferTimeline({ transfer }: { transfer: Transfer }) {
  let cursor = transfer.departureTime;

  return (
    <div className="pt-3 mt-3 border-t border-sand">
      {transfer.segments.map((seg, i) => {
        const t = cursor;
        cursor = addMin(cursor, seg.durationMinutes);
        return (
          <TransferSegmentItem
            key={seg.id}
            segment={seg}
            startTime={t}
            isLast={i === transfer.segments.length - 1}
          />
        );
      })}

      {/* Arrival terminal row */}
      <div className="flex gap-3 items-center">
        <div className="flex flex-col items-center w-11 shrink-0">
          <span className="text-[10px] font-mono font-semibold text-coral-500 tabular-nums">{cursor}</span>
          <div className="w-3 h-3 rounded-full border-2 border-coral-400 bg-coral-100 mt-1" />
        </div>
        <span className="text-[11px] font-semibold text-coral-600">Arrivée</span>
      </div>
    </div>
  );
}

// ── TransferSummary ───────────────────────────────────────────────────────────

export function TransferSummary({ transfer }: { transfer: Transfer }) {
  const progress = getBookingProgress(transfer);
  const allBooked = progress.pending === 0 && progress.total > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
      <span className="flex items-center gap-1">
        <Timer size={10} />
        {formatDuration(getTotalDuration(transfer))}
      </span>
      {getTotalCost(transfer) > 0 && (
        <span className="flex items-center gap-0.5 font-medium text-gold-600">
          <Euro size={10} />{getTotalCost(transfer).toLocaleString('fr-FR')}
        </span>
      )}
      {allBooked ? (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 size={10} />Tout réservé
        </span>
      ) : progress.pending > 0 ? (
        <span className="flex items-center gap-1 text-amber-600">
          <AlertTriangle size={10} />{progress.pending} à réserver
        </span>
      ) : null}
    </div>
  );
}

// ── TransferTips ──────────────────────────────────────────────────────────────

function TransferTips({ transfer }: { transfer: Transfer }) {
  const tips = getTransferTips(transfer);
  if (tips.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 mt-2">
      {tips.map(tip => (
        <div
          key={tip.id}
          className={`flex items-start gap-1.5 text-[11px] leading-snug ${
            tip.severity === 'warning' ? 'text-amber-600' : 'text-blue-500'
          }`}
        >
          {tip.severity === 'warning'
            ? <AlertTriangle size={10} className="mt-0.5 shrink-0" />
            : <Info size={10} className="mt-0.5 shrink-0" />
          }
          <span>{tip.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── TransferCard ──────────────────────────────────────────────────────────────

export function TransferCard({ transfer, destinations, onUpdate, onDelete }: {
  transfer: Transfer;
  destinations: Destination[];
  onUpdate?: (t: Transfer) => void;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const from    = destinations.find(d => d.id === transfer.fromDestinationId);
  const to      = destinations.find(d => d.id === transfer.toDestinationId);
  const diff    = getDifficulty(transfer);
  const diffCfg = DIFFICULTY[diff];
  const arrival = getEstimatedArrival(transfer);

  // ── Edit mode ──
  if (editing && onUpdate) {
    return (
      <TransferForm
        initial={transfer}
        destinations={destinations}
        onSave={t => { onUpdate(t); setEditing(false); }}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sand shadow-warm overflow-hidden">

      {/* Clickable header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3.5 hover:bg-cream/40 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">

            {/* Route + difficulty */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-body font-semibold text-sm text-dark">
                {from?.emoji} {from?.name}
              </span>
              <span className="text-coral-400 text-xs shrink-0">→</span>
              <span className="font-body font-semibold text-sm text-dark">
                {to?.emoji} {to?.name}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffCfg.badge}`}>
                {diffCfg.label}
              </span>
            </div>

            {/* Date + time range */}
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {transfer.date && (
                <span className="text-xs text-gray-400">
                  📅 {format(new Date(transfer.date + 'T12:00:00'), 'd MMM', { locale: fr })}
                </span>
              )}
              {transfer.departureTime && (
                <span className="text-xs text-gray-500 font-mono tabular-nums">
                  {transfer.departureTime} <span className="text-gray-300">→</span> {arrival}
                </span>
              )}
            </div>

            <TransferSummary transfer={transfer} />
            <TransferTips transfer={transfer} />
          </div>

          {/* Actions + chevron */}
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {onUpdate && (
              <button
                onClick={e => { e.stopPropagation(); setEditing(true); }}
                className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"
                title="Modifier"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(transfer.id); }}
                className="p-1.5 text-gray-300 hover:text-coral-500 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            )}
            <div className="text-gray-300 pl-1">
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {transfer.notes && (
          <p className="text-[11px] text-gray-400 italic mt-2 leading-snug">{transfer.notes}</p>
        )}
      </button>

      {/* Expanded timeline */}
      {open && (
        <div className="px-4 pb-4">
          <TransferTimeline transfer={transfer} />
        </div>
      )}
    </div>
  );
}
