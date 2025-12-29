import { useState } from 'react';
import Sidebar from './components/Sidebar';
import UnitPanel from './components/UnitPanel';
import quotations from './data/quotations.json';

const RACES = ['protoss', 'terran', 'zerg'];

function App() {
  const [selectedRace, setSelectedRace] = useState('protoss');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const currentSections = quotations.races[selectedRace]?.sections || [];

  const handleRaceChange = (race) => {
    setSelectedRace(race);
    setSelectedUnit(null);
  };

  return (
    <div className={`flex h-screen ${selectedRace === 'terran' ? 'bg-terran-darker' : selectedRace === 'zerg' ? 'bg-zerg-darker' : 'bg-protoss-darker'}`}>
      <Sidebar
        sections={currentSections}
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
        selectedRace={selectedRace}
        onRaceChange={handleRaceChange}
        races={RACES}
      />
      <UnitPanel unit={selectedUnit} race={selectedRace} />
    </div>
  );
}

export default App;
