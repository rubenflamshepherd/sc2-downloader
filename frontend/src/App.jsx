import { useState } from 'react';
import Sidebar from './components/Sidebar';
import UnitPanel from './components/UnitPanel';
import quotations from './data/quotations.json';

const RACES = ['all', 'protoss', 'terran', 'zerg'];

function App() {
  const [selectedRace, setSelectedRace] = useState('protoss');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');

  const currentSections = selectedRace === 'all'
    ? Object.entries(quotations.races).flatMap(([race, data]) =>
        data.sections.map(section => ({
          ...section,
          name: `${race.charAt(0).toUpperCase() + race.slice(1)} - ${section.name}`,
          race,
          units: section.units.map(unit => ({ ...unit, race }))
        }))
      )
    : (quotations.races[selectedRace]?.sections || []).map(section => ({
        ...section,
        units: section.units.map(unit => ({ ...unit, race: selectedRace }))
      }));

  const handleRaceChange = (race) => {
    setSelectedRace(race);
    setSelectedUnit(null);
    setQuoteSearchQuery('');
  };

  return (
    <div className={`flex h-screen ${selectedRace === 'all' ? 'bg-gray-950' : selectedRace === 'terran' ? 'bg-terran-darker' : selectedRace === 'zerg' ? 'bg-zerg-darker' : 'bg-protoss-darker'}`}>
      <Sidebar
        sections={currentSections}
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
        selectedRace={selectedRace}
        onRaceChange={handleRaceChange}
        races={RACES}
        quoteSearchQuery={quoteSearchQuery}
        onQuoteSearchChange={setQuoteSearchQuery}
      />
      <UnitPanel
        unit={selectedUnit}
        race={selectedRace}
        sections={currentSections}
        quoteSearchQuery={quoteSearchQuery}
      />
    </div>
  );
}

export default App;
