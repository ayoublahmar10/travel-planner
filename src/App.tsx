import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTrip } from './hooks/useTrip';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DayCard from './components/DayCard';
import BudgetDashboard from './components/BudgetDashboard';
import AlertsPanel from './components/AlertsPanel';
import { Plane, Ship, Waves, Car } from 'lucide-react';
import { TransportType } from './types';

type Tab = 'planning' | 'budget' | 'alerts';

const transferIcons: Record<TransportType, typeof Plane> = {
  flight: Plane, ferry: Ship, fastboat: Waves, car: Car, taxi: Car, bike: Car, walk: Car,
};

export default function App() {
  const {
    trip,
    updateHotel,
    addActivity, updateActivity, deleteActivity, reorderActivities, toggleActivityBooked,
    addRestaurant, updateRestaurant, deleteRestaurant,
    addTransport, updateTransport, deleteTransport, toggleTransportBooked,
    toggleAlertStatus, addAlert, deleteAlert,
    getBudgetSummary,
  } = useTrip();

  const [activeTab,           setActiveTab]           = useState<Tab>('planning');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  const budget = getBudgetSummary();

  const filteredDays = selectedDestination
    ? trip.days.filter(d => d.destination === selectedDestination)
    : trip.days;

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;
    reorderActivities(source.droppableId, source.index, destination.index);
  };

  // Build transfer banners between destinations (last day of dest A → first day of dest B)
  const transferBanners: Record<string, { from: string; to: string; emoji: string }> = {};
  for (let i = 0; i < trip.destinations.length - 1; i++) {
    const from = trip.destinations[i];
    const to   = trip.destinations[i + 1];
    // Find last day of 'from'
    const lastDayOfFrom = [...trip.days].reverse().find(d => d.destination === from.id);
    if (lastDayOfFrom) {
      transferBanners[lastDayOfFrom.id] = {
        from: `${from.emoji} ${from.name}`,
        to:   `${to.emoji} ${to.name}`,
        emoji: to.emoji ?? '✈️',
      };
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header
        trip={trip}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDestination={selectedDestination}
        onDestinationChange={setSelectedDestination}
      />

      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          trip={trip}
          budget={budget}
          selectedDestination={selectedDestination}
          onDestinationChange={setSelectedDestination}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'planning' && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-6">
                {/* Mobile: destination info */}
                {selectedDestination && (
                  <div className="lg:hidden">
                    {(() => {
                      const dest = trip.destinations.find(d => d.id === selectedDestination);
                      return dest ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-sand shadow-warm">
                          <span className="text-3xl">{dest.emoji}</span>
                          <div>
                            <div className="font-display text-xl font-semibold text-dark">{dest.name}</div>
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

                {filteredDays.length === 0 ? (
                  <div className="py-20 text-center text-gray-300">
                    <p className="text-4xl mb-3">🗺️</p>
                    <p className="font-body">Aucun jour pour cette destination</p>
                  </div>
                ) : (
                  filteredDays.map((day) => {
                    const globalIndex = trip.days.findIndex(d => d.id === day.id);
                    const dest = trip.destinations.find(d => d.id === day.destination);
                    const isFirstOfDest = trip.days.filter(d => d.destination === day.destination)[0]?.id === day.id;
                    const transfer = transferBanners[day.id];

                    return (
                      <div key={day.id}>
                        <DayCard
                          day={day}
                          dayNumber={globalIndex + 1}
                          destination={dest}
                          isFirstOfDestination={isFirstOfDest}
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

                        {/* Transfer banner between destinations */}
                        {transfer && !selectedDestination && (
                          <div className="flex items-center gap-4 my-2 px-2">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                            <div className="flex items-center gap-2 px-4 py-2 bg-coral-50 border border-coral-200 rounded-full text-xs font-medium text-coral-600 shrink-0">
                              <Plane size={12} />
                              <span>{transfer.from}</span>
                              <span className="text-coral-300">→</span>
                              <span>{transfer.to}</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-coral-200 to-transparent" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </DragDropContext>
          )}

          {activeTab === 'budget' && (
            <BudgetDashboard budget={budget} trip={trip} />
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
    </div>
  );
}
