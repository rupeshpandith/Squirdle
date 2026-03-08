// Top bar with Squirdle logo tiles, stats button, back arrow, and theme toggle

import { useState } from 'react';
import Stats from './Stats';

// Mini colored tiles — consistent with home page
const TITLE_TILES = [
  { letter: 'S', color: 'correct' },
  { letter: 'Q', color: 'present' },
  { letter: 'U', color: 'absent' },
  { letter: 'I', color: 'correct' },
  { letter: 'R', color: 'present' },
  { letter: 'D', color: 'absent' },
  { letter: 'L', color: 'correct' },
  { letter: 'E', color: 'present' },
];

export default function Header({ theme, onToggleTheme, onBack }) {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <header className="header">
        {/* LEFT SIDE — Back arrow */}
        <div className="header-left">
          <button className="icon-btn" onClick={onBack} aria-label="Back to home">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        </div>

        {/* CENTER: SQUIRDLE logo as mini colored tiles */}
        <div className="title-tiles">
          {TITLE_TILES.map(({ letter, color }, i) => (
            <span key={`${letter}-${i}`} className={`title-tile ${color}`}>
              {letter}
            </span>
          ))}
        </div>

        {/* RIGHT SIDE — Stats + Theme toggle */}
        <div className="header-right">
          <button
            className="icon-btn"
            onClick={() => setShowStats(true)}
            aria-label="Statistics"
          >
            <span className="material-symbols-rounded">leaderboard</span>
          </button>
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-rounded">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {showStats && <Stats onClose={() => setShowStats(false)} />}
    </>
  );
}