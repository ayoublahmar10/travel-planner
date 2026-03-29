import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Hotel, MapPin, Clock, DollarSign } from 'lucide-react';
import { Trip, BudgetSummary } from '../types';

interface SidebarProps {
  trip: Trip;
  budget: BudgetSummary;
  selectedDestination: string | null;
  onDestinationChange: (id: string | null) => void;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export default function Sidebar({ trip, budget, selectedDestination, onDestinationChange }: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-0 sticky top-0 h-screen overflow-y-auto border-r border-sand bg-white/60 backdrop-blur-sm no-print">
      {/* Destinations timeline */}
      <div className="p-5 border-b border-sand">
        <h2 className="font-display text-lg font-semibold text-forest mb-4 tracking-wide">
          Itinéraire
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-sand" />

          <div className="flex flex-col gap-1">
            {trip.destinations.map((dest, i) => {
              const days = trip.days.filter(d => d.destination === dest.id);
              const nightCount = dest.hotel.nights;
              const isActive = selectedDestination === dest.id;

              return (
                <button
                  key={dest.id}
                  onClick={() => onDestinationChange(isActive ? null : dest.id)}
                  className={`relative flex items-start gap-4 p-3 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-coral-50 border border-coral-200 shadow-warm'
                      : 'hover:bg-cream border border-transparent'
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Dot */}
                  <div className={`relative z-10 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm transition-all ${
                    isActive ? 'bg-coral-500 shadow-warm' : 'bg-sand group-hover:bg-coral-100'
                  }`}>
                    <span>{dest.emoji}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-body font-semibold text-sm truncate ${isActive ? 'text-coral-700' : 'text-dark'}`}>
                        {dest.name}
                      </span>
                      <span className="text-xs text-gold-600 font-medium shrink-0">
                        {nightCount}n
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Calendar2 size={10} />
                      <span>
                        {format(new Date(dest.startDate), 'd MMM', { locale: fr })}
                        {' → '}
                        {format(new Date(dest.endDate), 'd MMM', { locale: fr })}
                      </span>
                    </div>
                    {isActive && (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Hotel size={10} className="text-coral-400" />
                          <span className="truncate">{dest.hotel.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <DollarSign size={10} className="text-gold-500" />
                          <span>{fmt(budget.byDestination[dest.id] ?? 0)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {days.length} jour{days.length > 1 ? 's' : ''} de programme
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget mini summary */}
      <div className="p-5 border-b border-sand">
        <h3 className="font-display text-sm font-semibold text-forest mb-3 tracking-wide uppercase">
          Budget total
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Hôtels',       value: budget.hotels,     color: 'bg-coral-400' },
            { label: 'Activités',    value: budget.activities, color: 'bg-gold-400' },
            { label: 'Restaurants',  value: budget.food,       color: 'bg-forest' },
            { label: 'Transports',   value: budget.transport,  color: 'bg-blush' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs text-gray-500 flex-1">{item.label}</span>
              <span className="text-xs font-medium text-dark">{fmt(item.value)}</span>
            </div>
          ))}
          <div className="border-t border-sand pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-forest uppercase tracking-wide">Total</span>
            <span className="text-sm font-bold text-coral-600">{fmt(budget.total)}</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MapPin,  label: 'Îles',       value: trip.destinations.length },
            { icon: Clock,   label: 'Jours',      value: trip.days.length },
            { icon: Hotel,   label: 'Hôtels',     value: trip.destinations.length },
            { icon: DollarSign, label: 'Activités', value: trip.days.reduce((s, d) => s + d.activities.length, 0) },
          ].map(item => (
            <div key={item.label} className="bg-cream rounded-xl p-3 text-center">
              <item.icon size={16} className="text-coral-400 mx-auto mb-1" />
              <div className="text-lg font-display font-semibold text-dark leading-none">{item.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// tiny icon shim
function Calendar2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
