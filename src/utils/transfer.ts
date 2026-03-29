import { Transfer, TransferDifficulty } from '../types';

/** Total duration of the transfer (all segments, including buffers). */
export function getTotalDuration(transfer: Transfer): number {
  return transfer.segments.reduce((sum, s) => sum + s.durationMinutes, 0);
}

/** Total cost of all segments (buffers have no cost, so they contribute 0). */
export function getTotalCost(transfer: Transfer): number {
  return transfer.segments.reduce((sum, s) => sum + s.cost, 0);
}

/** Duration of actual transport segments only (excludes buffers/waits). */
export function getTransportTime(transfer: Transfer): number {
  return transfer.segments
    .filter(s => !s.isBuffer)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/** Duration of buffer/waiting segments only. */
export function getBufferTime(transfer: Transfer): number {
  return transfer.segments
    .filter(s => s.isBuffer)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/** Compute difficulty from total duration and number of distinct transport modes. */
export function computeDifficulty(transfer: Transfer): TransferDifficulty {
  const total = getTotalDuration(transfer);
  const transportSegments = transfer.segments.filter(s => !s.isBuffer);
  const uniqueTypes = new Set(transportSegments.map(s => s.type)).size;

  if (total > 240 || uniqueTypes >= 3) return 'challenging';
  if (total > 90 || uniqueTypes >= 2) return 'moderate';
  return 'easy';
}

/** Return the explicit difficulty override if set, otherwise compute it. */
export function getDifficulty(transfer: Transfer): TransferDifficulty {
  return transfer.difficulty ?? computeDifficulty(transfer);
}

/** Compute estimated arrival time (HH:MM) from departure time + total duration. */
export function getEstimatedArrival(transfer: Transfer): string {
  const [h, m] = transfer.departureTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + getTotalDuration(transfer);
  const arrH = Math.floor(totalMinutes / 60) % 24;
  const arrM = totalMinutes % 60;
  return `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
}

/** Booking progress across bookable segments (non-buffer). */
export function getBookingProgress(transfer: Transfer): {
  total: number;
  booked: number;
  confirmed: number;
  pending: number;
} {
  const bookable = transfer.segments.filter(s => !s.isBuffer);
  return {
    total:     bookable.length,
    booked:    bookable.filter(s => s.bookingStatus === 'booked').length,
    confirmed: bookable.filter(s => s.bookingStatus === 'confirmed').length,
    pending:   bookable.filter(s => s.bookingStatus === 'pending').length,
  };
}

/** Format a duration in minutes to a human-readable string (e.g. "1h30", "45min"). */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

// ── Contextual tips ───────────────────────────────────────────────────────────

export type TipSeverity = 'tip' | 'warning';

export interface TransferTip {
  id: string;
  severity: TipSeverity;
  message: string;
}

/**
 * Returns a list of contextual tips/warnings for a transfer.
 * Rules are purely derived from the existing data — no external dependencies.
 */
export function getTransferTips(transfer: Transfer): TransferTip[] {
  if (transfer.segments.length === 0) return [];

  const tips: TransferTip[] = [];
  const totalMin  = getTotalDuration(transfer);
  const { pending } = getBookingProgress(transfer);
  const transport = transfer.segments.filter(s => !s.isBuffer);
  const buffers   = transfer.segments.filter(s => s.isBuffer);

  // ── Unsecured booking (priority: shown first) ──
  if (pending > 1) {
    tips.push({ id: 'unsecured', severity: 'warning',
      message: `${pending} segments pas encore réservés — trajet non sécurisé`,
    });
  } else if (pending === 1) {
    tips.push({ id: 'unsecured', severity: 'warning',
      message: '1 segment pas encore réservé',
    });
  }

  // ── No buffer in multi-leg journey ──
  if (transport.length >= 2 && buffers.length === 0) {
    tips.push({ id: 'no-buffer', severity: 'warning',
      message: 'Aucun temps tampon entre les correspondances — risqué en cas de retard',
    });
  }

  // ── Long journey ──
  if (totalMin > 240) {
    tips.push({ id: 'long-journey', severity: 'tip',
      message: 'Journée de transit — évitez de planifier des activités ce jour-là',
    });
  }

  // ── Late arrival ──
  if (transfer.departureTime) {
    const arrival = getEstimatedArrival(transfer);
    const arrHour = parseInt(arrival.split(':')[0], 10);
    if (arrHour >= 17) {
      tips.push({ id: 'late-arrival', severity: 'tip',
        message: 'Arrivée en soirée — prévoir une installation tranquille à l\'hôtel',
      });
    }
  }

  // ── Very early departure ──
  if (transfer.departureTime) {
    const depHour = parseInt(transfer.departureTime.split(':')[0], 10);
    if (depHour < 6) {
      tips.push({ id: 'early-dep', severity: 'tip',
        message: 'Départ très matinal — organiser le check-out et le réveil la veille',
      });
    }
  }

  return tips;
}
