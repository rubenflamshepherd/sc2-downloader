import { useState, useEffect } from 'react';

const raceConfig = {
  protoss: {
    label: 'Protoss',
    bgClass: 'bg-protoss-dark',
    borderClass: 'border-protoss-primary/20',
    primaryClass: 'text-protoss-primary',
    inputBg: 'bg-protoss-darker',
    inputBorder: 'border-protoss-primary/30',
    inputFocus: 'focus:border-protoss-primary',
    selectedBg: 'bg-protoss-primary/20',
  },
  terran: {
    label: 'Terran',
    bgClass: 'bg-terran-dark',
    borderClass: 'border-terran-primary/20',
    primaryClass: 'text-terran-primary',
    inputBg: 'bg-terran-darker',
    inputBorder: 'border-terran-primary/30',
    inputFocus: 'focus:border-terran-primary',
    selectedBg: 'bg-terran-primary/20',
  },
  zerg: {
    label: 'Zerg',
    bgClass: 'bg-zerg-dark',
    borderClass: 'border-zerg-primary/20',
    primaryClass: 'text-zerg-primary',
    inputBg: 'bg-zerg-darker',
    inputBorder: 'border-zerg-primary/30',
    inputFocus: 'focus:border-zerg-primary',
    selectedBg: 'bg-zerg-primary/20',
  },
};

export default function Sidebar({ sections, selectedUnit, onSelectUnit, selectedRace, onRaceChange, races }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const config = raceConfig[selectedRace] || raceConfig.protoss;

  useEffect(() => {
    setExpandedSections(
      sections.reduce((acc, section) => ({ ...acc, [section.name]: true }), {})
    );
  }, [sections]);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const filteredSections = sections.map(section => ({
    ...section,
    units: section.units.filter(unit =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.units.length > 0);

  return (
    <div className={`w-72 ${config.bgClass} border-r ${config.borderClass} flex flex-col h-screen`}>
      <div className={`p-4 border-b ${config.borderClass}`}>
        <h1 className={`text-lg font-bold ${config.primaryClass} mb-3`}>SC2 Quotes Browser</h1>

        <div className="flex gap-1 mb-3">
          {races.map((race) => (
            <button
              key={race}
              onClick={() => onRaceChange(race)}
              className={`flex-1 py-1.5 px-2 text-sm font-medium rounded transition-colors capitalize ${
                selectedRace === race
                  ? `${raceConfig[race].selectedBg} ${raceConfig[race].primaryClass}`
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {raceConfig[race]?.label || race}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-3 py-2 ${config.inputBg} border ${config.inputBorder} rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none ${config.inputFocus}`}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredSections.map((section) => (
          <div key={section.name} className="mb-2">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex items-center gap-2 w-full text-left py-2 px-2 rounded hover:bg-white/5 transition-colors"
            >
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform ${expandedSections[section.name] ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <polygon points="8,5 19,12 8,19" />
              </svg>
              <span className="text-sm font-semibold text-gray-300">{section.name}</span>
              <span className="text-xs text-gray-500">({section.units.length})</span>
            </button>

            {expandedSections[section.name] && (
              <div className="ml-4">
                {section.units.map((unit) => (
                  <button
                    key={unit.name}
                    onClick={() => onSelectUnit(unit)}
                    className={`w-full text-left py-1.5 px-2 rounded text-sm transition-colors ${
                      selectedUnit?.name === unit.name
                        ? `${config.selectedBg} ${config.primaryClass}`
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`p-3 border-t ${config.borderClass} text-xs text-gray-500`}>
        Audio from StarCraft Wiki
      </div>
    </div>
  );
}
