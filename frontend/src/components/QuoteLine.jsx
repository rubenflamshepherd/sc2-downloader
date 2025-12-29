import { useState, useRef } from 'react';

export default function QuoteLine({ quote, race = 'protoss' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  const raceColors = {
    protoss: { primary: 'text-protoss-primary', primaryBg: 'bg-protoss-primary/20', primaryHover: 'hover:bg-protoss-primary/40', secondary: 'text-protoss-secondary', secondaryBg: 'bg-protoss-secondary/20', secondaryHover: 'hover:bg-protoss-secondary/40' },
    terran: { primary: 'text-terran-primary', primaryBg: 'bg-terran-primary/20', primaryHover: 'hover:bg-terran-primary/40', secondary: 'text-terran-secondary', secondaryBg: 'bg-terran-secondary/20', secondaryHover: 'hover:bg-terran-secondary/40' },
    zerg: { primary: 'text-zerg-primary', primaryBg: 'bg-zerg-primary/20', primaryHover: 'hover:bg-zerg-primary/40', secondary: 'text-zerg-secondary', secondaryBg: 'bg-zerg-secondary/20', secondaryHover: 'hover:bg-zerg-secondary/40' },
  };
  const colors = raceColors[race] || raceColors.protoss;
  const primaryClass = colors.primary;
  const primaryBg = colors.primaryBg;
  const primaryHoverBg = colors.primaryHover;
  const secondaryClass = colors.secondary;
  const secondaryBg = colors.secondaryBg;
  const secondaryHoverBg = colors.secondaryHover;

  // Proxy audio through backend to handle CORS and missing files
  const proxyUrl = `http://localhost:3001/api/audio?url=${encodeURIComponent(quote.audioUrl)}`;

  const handlePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Play error:', error);
          // Try loading first, then playing
          audioRef.current.load();
          try {
            await audioRef.current.play();
          } catch (retryError) {
            console.error('Retry play error:', retryError);
          }
        }
      }
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Extract filename from URL
      const urlParts = quote.audioUrl.split('/');
      const oggFilename = urlParts.find(part => part.endsWith('.ogg')) || 'audio.ogg';
      const mp3Filename = oggFilename.replace('.ogg', '.mp3');

      const response = await fetch(
        `http://localhost:3001/api/download?url=${encodeURIComponent(quote.audioUrl)}&filename=${encodeURIComponent(mp3Filename)}`
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mp3Filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Make sure the backend server is running.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded hover:bg-white/5 group">
      <audio
        ref={audioRef}
        src={proxyUrl}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      <button
        onClick={handlePlay}
        disabled={hasError}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          hasError
            ? 'bg-red-500/20 cursor-not-allowed'
            : `${primaryBg} ${primaryHoverBg}`
        }`}
        title={hasError ? 'Audio unavailable' : isPlaying ? 'Stop' : 'Play'}
      >
        {hasError ? (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : isPlaying ? (
          <svg className={`w-4 h-4 ${primaryClass}`} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 ${primaryClass} ml-0.5`} fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <span className="flex-grow text-gray-300 text-sm">{quote.text}</span>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`flex-shrink-0 w-8 h-8 rounded ${secondaryBg} ${secondaryHoverBg} flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50`}
        title="Download MP3"
      >
        {isDownloading ? (
          <svg className={`w-4 h-4 ${secondaryClass} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 ${secondaryClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
      </button>
    </div>
  );
}
