import { useState } from 'react';

export default function Sidebar({ sections, selectedUnit, onSelectUnit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(
    sections.reduce((acc, section) => ({ ...acc, [section.name]: true }), {})
  );

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
    <div className="w-72 bg-protoss-dark border-r border-protoss-primary/20 flex flex-col h-screen">
      <div className="p-4 border-b border-protoss-primary/20">
        <h1 className="text-lg font-bold text-protoss-primary mb-3">SC2 Protoss Quotes</h1>
        <input
          type="text"
          placeholder="Search units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-protoss-darker border border-protoss-primary/30 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-protoss-primary"
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
                        ? 'bg-protoss-primary/20 text-protoss-primary'
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

      <div className="p-3 border-t border-protoss-primary/20 text-xs text-gray-500">
        Audio from StarCraft Wiki
      </div>
    </div>
  );
}
