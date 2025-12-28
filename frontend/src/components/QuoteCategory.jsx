import { useState } from 'react';
import QuoteLine from './QuoteLine';

export default function QuoteCategory({ category }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left py-2 px-3 rounded hover:bg-white/5 transition-colors"
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <polygon points="8,5 19,12 8,19" />
        </svg>
        <span className="text-protoss-primary font-medium">{category.name}</span>
        <span className="text-gray-500 text-sm">({category.quotes.length})</span>
      </button>

      {isExpanded && (
        <div className="ml-4 border-l border-protoss-primary/20 pl-2">
          {category.quotes.map((quote, index) => (
            <QuoteLine key={index} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
