import { useState } from 'react';
import { Euro, Timer, Route, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { Trip, Transfer } from '../types';
import { TransferCard } from './TransferCard';
import { TransferForm } from './TransferForm';
import { getTotalCost, getTotalDuration, getBookingProgress, formatDuration } from '../utils/transfer';

interface Props {
  trip: Trip;
  onAdd:    (t: Transfer) => void;
  onUpdate: (t: Transfer) => void;
  onDelete: (id: string)  => void;
}

export default function TravelLogisticsPanel({ trip, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const transfers = trip.transfers ?? [];

  const totalCost     = transfers.reduce((s, t) => s + getTotalCost(t), 0);
  const totalDuration = transfers.reduce((s, t) => s + getTotalDuration(t), 0);
  const totalPending  = transfers.reduce((s, t) => s + getBookingProgress(t).pending, 0);
  const allBooked     = totalPending === 0 && transfers.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Stats bar ── */}
      {transfers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-sand shadow-warm p-3 text-center">
            <div className="text-xl font-display font-semibold text-dark">{transfers.length}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
              <Route size={9} />transferts
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand shadow-warm p-3 text-center">
            <div className="text-xl font-display font-semibold text-dark">{formatDuration(totalDuration)}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
              <Timer size={9} />en transit
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand shadow-warm p-3 text-center">
            <div className="text-xl font-display font-semibold text-gold-600">
              {totalCost.toLocaleString('fr-FR')} €
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
              <Euro size={9} />transports
            </div>
          </div>
        </div>
      )}

      {/* ── Booking alert ── */}
      {transfers.length > 0 && (
        allBooked ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Tous les segments sont réservés ou confirmés</span>
          </div>
        ) : totalPending > 0 ? (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{totalPending} segment{totalPending > 1 ? 's' : ''} encore à réserver</span>
          </div>
        ) : null
      )}

      {/* ── Header row: title + add button ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {transfers.length === 0 ? 'Aucun transfert' : `${transfers.length} transfert${transfers.length > 1 ? 's' : ''}`}
        </span>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-coral-500 hover:text-coral-600 flex items-center gap-1 font-medium"
          >
            <Plus size={13} />Ajouter un transfert
          </button>
        )}
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <TransferForm
          destinations={trip.destinations}
          onSave={t => { onAdd(t); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ── Transfer cards ── */}
      {transfers.length === 0 && !showForm ? (
        <div className="py-16 text-center text-gray-300">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-body text-sm">Aucun transfert renseigné</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un transfert" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map(transfer => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              destinations={trip.destinations}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
