import { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTrips } from './hooks/useTrips';
import { useTrip } from './hooks/useTrip';
import { Trip, Transfer } from './types';
import { TransferCard } from './components/TransferCard';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DayCard from './components/DayCard';
import BudgetDashboard from './components/BudgetDashboard';
import AlertsPanel from './components/AlertsPanel';
import TravelLogisticsPanel from './components/TravelLogisticsPanel';
import { Plane, LayoutList, PieChart, Bell, CalendarCheck, Route } from 'lucide-react';
import FlightBanner from './components/FlightBanner';
import { getBookingProgress } from './utils/transfer';

type Tab = 'planning' | 'budget' | 'logistics' | 'alerts';

// ── Trip View ─────────────────────────────────────────────────────────────────

function TripView({ trip, onBack, onUpdate }: { trip: Trip; onBack: () => void; onUpdate: (t: Trip) => void }) {
  const {
    updateHotel,
    addFlight, updateFlight, deleteFlight, toggleFlightBooked,
    addActivity, updateActivity, deleteActivity, reorderActivities, toggleActivityBooked,
    addRestaurant, updateRestaurant, deleteRestaurant,
    addTransport, updateTransport, deleteTransport, toggleTransportBooked,
    addTransfer, updateTransfer, deleteTransfer,
    toggleAlertStatus, addAlert, deleteAlert,
    getBudgetSummary,
  } = useTrip(trip, onUpdate);

  const [activeTab,           setActiveTab]           = useState<Tab>('planning');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const todayCardRef = useRef<HTMLDivElement | null>(null);

  const budget = getBudgetSummary();
  const pendingAlerts   = trip.alerts.filter(a => a.status === 'pending').length;
  const pendingTransfers = (trip.transfers ?? []).reduce((s, t) => s + getBookingProgress(t).pending, 0);

  const filteredDays = selectedDestination
    ? trip.days.filter(d => d.destination === selectedDestination)
    : trip.days;

  // Find today's day
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDayId = trip.days.find(d => d.date === todayStr)?.id ?? null;

  const scrollToToday = () => {
    if (activeTab !== 'planning') setActiveTab('planning');
    setSelectedDestination(null);
    setTimeout(() => {
      todayCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;
    reorderActivities(source.droppableId, source.index, destination.index);
  };

  // Transfer points between destinations
  // Maps the last-day-id of each destination to its outgoing transfer (if any).
  const transferPoints: Record<string, { from: string; to: string; transfer?: Transfer }> = {};
  for (let i = 0; i < trip.destinations.length - 1; i++) {
    const fromDest = trip.destinations[i];
    const toDest   = trip.destinations[i + 1];
    const lastDayOfFrom = [...trip.days].reverse().find(d => d.destination === fromDest.id);
    if (lastDayOfFrom) {
      const transfer = (trip.transfers ?? []).find(
        t => t.fromDestinationId === fromDest.id && t.toDestinationId === toDest.id
      );
      transferPoints[lastDayOfFrom.id] = {
        from: `${fromDest.emoji} ${fromDest.name}`,
        to:   `${toDest.emoji} ${toDest.name}`,
        transfer,
      };
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body pb-16 sm:pb-0">
      <Header
        trip={trip}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDestination={selectedDestination}
        onDestinationChange={setSelectedDestination}
        onBack={onBack}
        logisticsCount={pendingTransfers}
      />

      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          trip={trip}
          budget={budget}
          selectedDestination={selectedDestination}
          onDestinationChange={setSelectedDestination}
        />

        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {activeTab === 'planning' && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-4 sm:space-y-6">
                {selectedDestination && (
                  <div className="lg:hidden">
                    {(() => {
                      const dest = trip.destinations.find(d => d.id === selectedDestination);
                      return dest ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-sand shadow-warm">
                          <span className="text-2xl">{dest.emoji}</span>
                          <div>
                            <div className="font-display text-lg font-semibold text-dark">{dest.name}</div>
                            <div className="text-xs text-gray-400">{dest.hotel.name} · {dest.hotel.nights} nuits</div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-sm font-bold text-coral-600">
                              {(budget.byDestination[dest.id] ?? 0).toLocaleString('fr-FR')} €
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Vol aller — avant tous les jours */}
                {!selectedDestination && (
                  <div className="bg-white rounded-2xl border border-sand shadow-warm p-4 sm:p-5">
                    <FlightBanner
                      flights={trip.flights ?? []}
                      direction="outbound"
                      onAdd={addFlight}
                      onUpdate={updateFlight}
                      onDelete={deleteFlight}
                      onToggleBooked={toggleFlightBooked}
                    />
                  </div>
                )}

                {filteredDays.length === 0 ? (
                  <div className="py-20 text-center text-gray-300">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="font-body">Aucun jour pour cette destination</p>
                  </div>
                ) : (
                  filteredDays.map(day => {
                    const globalIndex = trip.days.findIndex(d => d.id === day.id);
                    const dest = trip.destinations.find(d => d.id === day.destination);
                    const isFirstOfDest = trip.days.filter(d => d.destination === day.destination)[0]?.id === day.id;
                    const transferPoint = transferPoints[day.id];
                    const isToday = day.id === todayDayId;

                    return (
                      <div key={day.id} ref={isToday ? todayCardRef : null}>
                        {isToday && (
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="flex-1 h-px bg-coral-200" />
                            <span className="text-xs font-semibold text-coral-500 uppercase tracking-widest px-2">Aujourd'hui</span>
                            <div className="flex-1 h-px bg-coral-200" />
                          </div>
                        )}
                        <DayCard
                          day={day}
                          dayNumber={globalIndex + 1}
                          destination={dest}
                          isFirstOfDestination={isFirstOfDest}
                          isToday={isToday}
                          onUpdateHotel={updateHotel}
                          onAddActivity={addActivity}
                          onUpdateActivity={updateActivity}
                          onDeleteActivity={deleteActivity}
                          onToggleActivityBooked={toggleActivityBooked}
                          onAddRestaurant={addRestaurant}
                          onUpdateRestaurant={updateRestaurant}
                          onDeleteRestaurant={deleteRestaurant}
                          onAddTransport={addTransport}
                          onUpdateTransport={updateTransport}
                          onDeleteTransport={deleteTransport}
                          onToggleTransportBooked={toggleTransportBooked}
                        />
                        {transferPoint && !selectedDestination && (
                          transferPoint.transfer ? (
                            // ── Full transfer card ──────────────────────────
                            <div className="mt-4 mb-2">
                              <div className="flex items-center gap-3 mb-3 px-1">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-coral-500 uppercase tracking-widest shrink-0">
                                  <Plane size={10} />
                                  <span>Transfert</span>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                              </div>
                              <TransferCard
                                transfer={transferPoint.transfer}
                                destinations={trip.destinations}
                                onUpdate={updateTransfer}
                                onDelete={deleteTransfer}
                              />
                            </div>
                          ) : (
                            // ── Fallback pill (no transfer data) ───────────
                            <div className="flex items-center gap-3 my-2 px-1">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-coral-50 border border-coral-200 rounded-full text-xs font-medium text-coral-600 shrink-0">
                                <Plane size={11} />
                                <span>{transferPoint.from}</span>
                                <span className="text-coral-300">→</span>
                                <span>{transferPoint.to}</span>
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                )}
                {/* Vol retour — après tous les jours */}
                {!selectedDestination && (
                  <div className="bg-white rounded-2xl border border-sand shadow-warm p-4 sm:p-5">
                    <FlightBanner
                      flights={trip.flights ?? []}
                      direction="return"
                      onAdd={addFlight}
                      onUpdate={updateFlight}
                      onDelete={deleteFlight}
                      onToggleBooked={toggleFlightBooked}
                    />
                  </div>
                )}
              </div>
            </DragDropContext>
          )}

          {activeTab === 'budget' && <BudgetDashboard budget={budget} trip={trip} />}

          {activeTab === 'logistics' && (
            <TravelLogisticsPanel
              trip={trip}
              onAdd={addTransfer}
              onUpdate={updateTransfer}
              onDelete={deleteTransfer}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPanel
              trip={trip}
              onToggleStatus={toggleAlertStatus}
              onDelete={deleteAlert}
              onAdd={addAlert}
            />
          )}
        </main>
      </div>

      {/* ── Bottom nav bar — mobile uniquement ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand z-40 flex">
        {([
          { id: 'planning'  as Tab, label: 'Planning', icon: LayoutList, badge: 0 },
          { id: 'budget'    as Tab, label: 'Budget',   icon: PieChart,   badge: 0 },
          { id: 'logistics' as Tab, label: 'Trajets',  icon: Route,      badge: pendingTransfers },
          { id: 'alerts'    as Tab, label: 'Alertes',  icon: Bell,       badge: pendingAlerts },
        ]).map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-body font-medium transition-colors ${
              activeTab === id ? 'text-coral-500' : 'text-gray-400'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
            {badge > 0 && (
              <span className="absolute top-2 right-1/4 w-4 h-4 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                {badge}
              </span>
            )}
          </button>
        ))}

        {/* Bouton Aujourd'hui — uniquement si le voyage est en cours */}
        {todayDayId && (
          <button
            onClick={scrollToToday}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-body font-medium text-gold-600"
          >
            <CalendarCheck size={20} />
            <span>Auj.</span>
          </button>
        )}
      </nav>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { trips, loading, error, addTrip, updateTrip, deleteTrip } = useTrips();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const handleUpdate = useCallback((updated: Trip) => {
    updateTrip(updated);
    setActiveTrip(updated);
  }, [updateTrip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-coral-300 border-t-coral-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-body">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-xs">
          <p className="text-2xl">⚠️</p>
          <p className="text-sm text-gray-600 font-body">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-4 py-2 bg-coral-500 text-white rounded-lg font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (activeTrip) {
    const current = trips.find(t => t.id === activeTrip.id) ?? activeTrip;
    return (
      <TripView
        trip={current}
        onBack={() => setActiveTrip(null)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <HomePage
      trips={trips}
      onOpen={setActiveTrip}
      onCreate={trip => { addTrip(trip); setActiveTrip(trip); }}
      onDelete={deleteTrip}
    />
  );
}
