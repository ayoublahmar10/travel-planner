import { BudgetSummary, Trip } from '../types';

interface BudgetDashboardProps {
  budget: BudgetSummary;
  trip: Trip;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

// ── SVG Donut Chart ──────────────────────────────────────────────────────────

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const R = 42;
  const CX = 50;
  const CY = 50;
  const INNER_R = 26;

  let currentAngle = -90;
  const gap = 2; // degrees gap between slices

  const paths = segments.map((seg, i) => {
    if (seg.value === 0) return null;
    const angleDeg = (seg.value / total) * (360 - gap * segments.filter(s => s.value > 0).length);
    const startAngle = currentAngle;
    const endAngle = startAngle + angleDeg;
    currentAngle = endAngle + gap;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad   = (endAngle   * Math.PI) / 180;

    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);

    const largeArc = angleDeg > 180 ? 1 : 0;

    const xi1 = CX + INNER_R * Math.cos(startRad);
    const yi1 = CY + INNER_R * Math.sin(startRad);
    const xi2 = CX + INNER_R * Math.cos(endRad);
    const yi2 = CY + INNER_R * Math.sin(endRad);

    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return <path key={i} d={d} fill={seg.color} className="transition-opacity hover:opacity-80" />;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[200px] mx-auto drop-shadow-md">
      {paths}
      {/* Center text */}
      <text x="50" y="47" textAnchor="middle" className="fill-current" style={{ fontSize: 7, fontFamily: 'DM Sans', fill: '#6b7280' }}>
        Total
      </text>
      <text x="50" y="57" textAnchor="middle" style={{ fontSize: 8.5, fontFamily: 'Cormorant Garamond', fontWeight: 600, fill: '#1A1208' }}>
        {fmt(total)}
      </text>
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  hotels:     '#C4715A',
  activities: '#C9973F',
  food:       '#2D4A3E',
  transport:  '#F5D5CA',
};

const CATEGORY_LABELS = {
  hotels:     { label: 'Hôtels',      emoji: '🏨' },
  activities: { label: 'Activités',   emoji: '🎯' },
  food:       { label: 'Restaurants', emoji: '🍽️' },
  transport:  { label: 'Transports',  emoji: '🚗' },
};

export default function BudgetDashboard({ budget, trip }: BudgetDashboardProps) {
  const categories = (Object.keys(CATEGORY_COLORS) as (keyof typeof CATEGORY_COLORS)[]).map(key => ({
    key,
    value: budget[key as keyof BudgetSummary] as number,
    color: CATEGORY_COLORS[key],
    ...CATEGORY_LABELS[key],
  }));

  return (
    <div className="space-y-6">
      {/* Total hero */}
      <div className="bg-hero-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-coral-700 opacity-20 blur-2xl" />
        <p className="font-body text-sm text-white/60 uppercase tracking-widest mb-1">Budget total estimé</p>
        <p className="font-display text-5xl font-light tracking-wide">{fmt(budget.total)}</p>
        <p className="font-body text-xs text-white/40 mt-2">Basé sur les coûts estimés pour {trip.days.length} jours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-sand shadow-warm p-6">
          <h3 className="font-display text-lg font-semibold text-dark mb-4">Répartition</h3>
          <DonutChart segments={categories.map(c => ({ value: c.value, color: c.color, label: c.label }))} />
          <div className="mt-4 space-y-2">
            {categories.map(c => (
              <div key={c.key} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-sm text-gray-600 flex-1">{c.emoji} {c.label}</span>
                <span className="text-xs text-gray-400">{pct(c.value, budget.total)}%</span>
                <span className="text-sm font-semibold text-dark w-24 text-right">{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-sand shadow-warm p-6">
          <h3 className="font-display text-lg font-semibold text-dark mb-4">Détail par catégorie</h3>
          <div className="space-y-3">
            {categories.map(c => (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-dark">{c.emoji} {c.label}</span>
                  <span className="text-sm font-bold" style={{ color: c.color }}>{fmt(c.value)}</span>
                </div>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct(c.value, budget.total)}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{pct(c.value, budget.total)}% du total</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per destination */}
      <div className="bg-white rounded-2xl border border-sand shadow-warm p-6">
        <h3 className="font-display text-lg font-semibold text-dark mb-5">Budget par destination</h3>
        <div className="space-y-3">
          {trip.destinations.map(dest => {
            const destTotal  = budget.byDestination[dest.id] ?? 0;
            const hotelCost  = dest.hotel.costPerNight * dest.hotel.nights;
            const actCost    = trip.days
              .filter(d => d.destination === dest.id)
              .reduce((s, d) => s + d.activities.reduce((as, a) => as + a.cost, 0), 0);
            const foodCost   = trip.days
              .filter(d => d.destination === dest.id)
              .reduce((s, d) => s + d.restaurants.reduce((rs, r) => rs + r.estimatedCost, 0), 0);
            const transCost  = trip.days
              .filter(d => d.destination === dest.id)
              .reduce((s, d) => s + d.transports.reduce((ts, t) => ts + t.cost, 0), 0);

            return (
              <div key={dest.id} className="p-4 rounded-xl border border-sand hover:border-coral-200 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dest.emoji}</span>
                    <span className="font-body font-semibold text-dark">{dest.name}</span>
                    <span className="text-xs text-gray-400">{dest.hotel.nights} nuits</span>
                  </div>
                  <span className="font-display text-xl font-semibold text-coral-600">{fmt(destTotal)}</span>
                </div>
                <div className="h-1.5 bg-sand rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-coral-400 transition-all duration-700"
                    style={{ width: `${pct(destTotal, budget.total)}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { label: 'Hôtel',     value: hotelCost,  color: 'text-coral-600' },
                    { label: 'Activités', value: actCost,    color: 'text-gold-600' },
                    { label: 'Resto',     value: foodCost,   color: 'text-forest' },
                    { label: 'Transport', value: transCost,  color: 'text-blue-500' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className={`font-semibold ${item.color}`}>{fmt(item.value)}</div>
                      <div className="text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day-by-day mini table */}
        <details className="mt-4">
          <summary className="text-xs text-coral-500 cursor-pointer hover:text-coral-700 font-medium">
            Voir le détail jour par jour
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-sand">
                  <th className="text-left py-2 pr-3 text-gray-400 font-medium">Jour</th>
                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Activités</th>
                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Restaurants</th>
                  <th className="text-right py-2 px-2 text-gray-400 font-medium">Transport</th>
                  <th className="text-right py-2 pl-2 text-gray-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {trip.days.map((day, i) => {
                  const acts  = day.activities.reduce((s, a) => s + a.cost, 0);
                  const food  = day.restaurants.reduce((s, r) => s + r.estimatedCost, 0);
                  const trans = day.transports.reduce((s, t) => s + t.cost, 0);
                  const tot   = acts + food + trans;
                  if (tot === 0) return null;
                  return (
                    <tr key={day.id} className="border-b border-sand/50 hover:bg-cream transition-colors">
                      <td className="py-2 pr-3 text-gray-600">
                        <span className="text-gray-400">J{i + 1}</span> · {day.location}
                      </td>
                      <td className="text-right py-2 px-2 text-gold-600">{acts > 0 ? `${acts}€` : '–'}</td>
                      <td className="text-right py-2 px-2 text-forest">{food > 0 ? `${food}€` : '–'}</td>
                      <td className="text-right py-2 px-2 text-blue-500">{trans > 0 ? `${trans}€` : '–'}</td>
                      <td className="text-right py-2 pl-2 font-semibold text-dark">{tot > 0 ? `${tot}€` : '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
