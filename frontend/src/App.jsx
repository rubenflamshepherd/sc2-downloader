import { useState } from 'react';
import Sidebar from './components/Sidebar';
import UnitPanel from './components/UnitPanel';
import quotations from './data/quotations.json';

function App() {
  const [selectedUnit, setSelectedUnit] = useState(null);

  return (
    <div className="flex h-screen bg-protoss-darker">
      <Sidebar
        sections={quotations.sections}
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
      />
      <UnitPanel unit={selectedUnit} />
    </div>
  );
}

export default App;
