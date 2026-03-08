import { useState, useEffect } from 'react';
import HowToPlay from './HowToPlay';
import Stats from './Stats';

// Logo tiles spelling SQUIRDLE with colored backgrounds — matches header
const LOGO_TILES = [
  { letter: 'S', color: 'correct' },
  { letter: 'Q', color: 'present' },
  { letter: 'U', color: 'absent' },
  { letter: 'I', color: 'correct' },
  { letter: 'R', color: 'present' },
  { letter: 'D', color: 'absent' },
  { letter: 'L', color: 'correct' },
  { letter: 'E', color: 'present' },
];

// Format today's date as "Month Day, Year"
function getFormattedDate() {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get day count since first install
function getDaySinceInstall() {
  const key = 'squirdle-install-date';
  let installDate = localStorage.getItem(key);
  if (!installDate) {
    installDate = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
    localStorage.setItem(key, installDate);
  }
  const start = new Date(installDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 864e5;
  return Math.floor((today - start) / msPerDay) + 1; // Day 1 on install day
}

export default function HomePage({ onPlay, theme, onToggleTheme, gameStatus }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tileVisible, setTileVisible] = useState(
    Array(LOGO_TILES.length).fill(false)
  );

  const dayCount = getDaySinceInstall();
  const alreadyPlayed = gameStatus !== 'playing';

  // Staggered entrance animation for logo tiles
  useEffect(() => {
    LOGO_TILES.forEach((_, i) => {
      setTimeout(() => {
        setTileVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 100 + i * 120);
    });
  }, []);

  return (
    <div className="home">
      {/* Top-right buttons: Stats + Theme toggle */}
      <div className="home-theme-toggle">
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

      <div className="home-content">
        {/* ── LOGO TILES (single heading, no duplicate text) ──── */}
        <div className="home-logo-tiles">
          {LOGO_TILES.map(({ letter, color }, i) => (
            <span
              key={`${letter}-${i}`}
              className={`home-logo-tile ${color} ${tileVisible[i] ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* ── SUBTITLE ───────────────────────────────────────── */}
        <p className="home-subtitle">
          Get 6 chances to guess<br />a 5-letter word.
        </p>

        {/* ── DIVIDER ────────────────────────────────────────── */}
        <div className="home-divider" />

        {/* ── PUZZLE INFO ────────────────────────────────────── */}
        <div className="home-puzzle-info">
          <span className="home-date">{getFormattedDate()}</span>
          <span className="home-puzzle-no">
            Day: {dayCount}
          </span>
        </div>

        {/* ── PLAY BUTTON ────────────────────────────────────── */}
        <button
          className="home-play-btn"
          onClick={onPlay}
          disabled={alreadyPlayed}
        >
          {alreadyPlayed ? 'Already Played Today' : 'Play'}
        </button>

        {/* ── HOW TO PLAY ────────────────────────────────────── */}
        <button
          className="home-htp-btn"
          onClick={() => setShowHowToPlay(true)}
        >
          How to Play
        </button>

        {/* ── COLOR LEGEND ───────────────────────────────────── */}
        <div className="home-legend">
          <div className="home-legend-item">
            <span className="home-legend-dot correct" />
            <span className="home-legend-label">Correct spot</span>
          </div>
          <div className="home-legend-item">
            <span className="home-legend-dot present" />
            <span className="home-legend-label">Wrong spot</span>
          </div>
          <div className="home-legend-item">
            <span className="home-legend-dot absent" />
            <span className="home-legend-label">Not in word</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="home-footer">
        <span>Created by </span>
        <a
          href="https://github.com/rupeshpandith/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rupesh Pandith
        </a>
      </footer>

      {/* ── HOW TO PLAY MODAL ────────────────────────────────── */}
      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}

      {/* ── STATS MODAL ──────────────────────────────────────── */}
      {showStats && (
        <Stats onClose={() => setShowStats(false)} />
      )}
    </div>
  );
}
