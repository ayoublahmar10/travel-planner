import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, MapPin, Calendar, LayoutList, PieChart, Bell, Printer } from 'lucide-react';
import { Trip } from '../types';

type Tab = 'planning' | 'budget' | 'alerts';

interface HeaderProps {
  trip: Trip;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  selectedDestination: string | null;
  onDestinationChange: (id: string | null) => void;
}

export default function Header({ trip, activeTab, onTabChange, selectedDestination, onDestinationChange }: HeaderProps) {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const totalDays = differenceInDays(end, start) + 1;

  const pendingAlerts = trip.alerts.filter(a => a.status === 'pending').length;

  return (
    <header className="relative overflow-hidden grain no-print">
      {/* Hero background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-coral-700 opacity-20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-gold-700 opacity-15 blur-2xl" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-forest opacity-30 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-2 text-gold-300 text-sm font-body tracking-widest uppercase">
            <Heart size={14} className="fill-current animate-float" />
            <span>Lune de Miel</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-white/50 hover:text-gold-300 transition-colors text-sm font-body"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>

        {/* Main title */}
        <div className="text-center py-8">
          <h1 className="font-display text-5xl sm:text-7xl font-light text-white tracking-wide leading-none mb-2 animate-slide-up">
            {trip.title}
          </h1>
          <p className="font-display text-xl sm:text-2xl text-gold-300 italic font-light animate-slide-up stagger-1 mb-2">
            {trip.subtitle}
          </p>
          <p className="font-body text-base text-white/60 flex items-center justify-center gap-2 animate-slide-up stagger-1 mb-6">
            <Heart size={13} className="fill-current text-rose-300" />
            {trip.couple}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm font-body animate-fade-in stagger-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gold-400" />
              <span>
                {format(start, 'd MMM', { locale: fr })} – {format(end, 'd MMM yyyy', { locale: fr })}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-coral-400" />
              <span>{trip.destinations.length} destinations</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-rose-300 fill-current" />
              <span>{totalDays} jours de bonheur</span>
            </div>
          </div>
        </div>

        {/* Destination pills */}
        <div className="flex flex-wrap justify-center gap-2 pb-5 animate-fade-in stagger-3">
          <button
            onClick={() => onDestinationChange(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-200 ${
              selectedDestination === null
                ? 'bg-gold-500 text-white shadow-gold'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Tous les jours
          </button>
          {trip.destinations.map(dest => (
            <button
              key={dest.id}
              onClick={() => onDestinationChange(dest.id === selectedDestination ? null : dest.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-200 ${
                selectedDestination === dest.id
                  ? 'bg-coral-500 text-white shadow-warm'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {dest.emoji} {dest.name}
            </button>
          ))}
        </div>

        {/* Tab navigation */}
        <nav className="flex border-t border-white/10 animate-fade-in stagger-4">
          {([
            { id: 'planning' as Tab, label: 'Planning', icon: LayoutList, badge: 0 },
            { id: 'budget'   as Tab, label: 'Budget',   icon: PieChart,   badge: 0 },
            { id: 'alerts'   as Tab, label: 'Alertes',  icon: Bell,       badge: pendingAlerts },
          ]).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-body font-medium transition-all duration-200 border-b-2 ${
                activeTab === id
                  ? 'text-gold-300 border-gold-400'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              <Icon size={15} />
              {label}
              {badge ? (
                <span className="absolute top-3 right-3 w-4 h-4 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
