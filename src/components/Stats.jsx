// Stats panel — summary, guess distribution, monthly calendar heatmap

import { useState } from 'react';
import { getStats, getHistory } from '../hooks/useWordle';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getMonthOffsets() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return [
    { year: y + Math.floor((m - 2) / 12), month: ((m - 2) % 12 + 12) % 12 },
    { year: y + Math.floor((m - 1) / 12), month: ((m - 1) % 12 + 12) % 12 },
    { year: y, month: m },
    { year: m === 11 ? y + 1 : y, month: (m + 1) % 12 },
  ];
}

function CalendarHeatmap() {
  const months = getMonthOffsets();
  const [tabIndex, setTabIndex] = useState(2); // default to current month
  const history = getHistory();

  const { year, month } = months[tabIndex];
  const { firstDay, daysInMonth } = getMonthData(year, month);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');

  // Build grid cells: leading blanks + day cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isFuture = dateStr > todayStr;
    const result = history[dateStr]; // 'won' | 'lost' | undefined
    cells.push({ day: d, dateStr, isFuture, result });
  }

  return (
    <div className="cal-heatmap">
      {/* TABS */}
      <div className="cal-tabs">
        {months.map((m, i) => (
          <button
            key={i}
            className={`cal-tab ${i === tabIndex ? 'active' : ''}`}
            onClick={() => setTabIndex(i)}
          >
            {new Date(m.year, m.month, 1).toLocaleDateString('en-US', { month: 'short' })}
          </button>
        ))}
      </div>

      {/* MONTH TITLE */}
      <div className="cal-month-title">{formatMonthLabel(year, month)}</div>

      {/* DAY HEADERS */}
      <div className="cal-grid">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="cal-day-header">{label}</div>
        ))}

        {/* CELLS */}
        {cells.map((cell, i) =>
          cell.day === null ? (
            <div key={`blank-${i}`} className="cal-cell blank" />
          ) : (
            <div
              key={cell.dateStr}
              className={`cal-cell ${
                cell.isFuture ? 'future'
                : cell.result === 'won' ? 'won'
                : cell.result === 'lost' ? 'lost'
                : 'unattempted'
              } ${cell.dateStr === todayStr ? 'today' : ''}`}
              title={`${cell.dateStr}${cell.result ? ` — ${cell.result}` : ''}`}
            >
              {cell.day}
            </div>
          )
        )}
      </div>

      {/* LEGEND */}
      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-legend-dot won" />Win</span>
        <span className="cal-legend-item"><span className="cal-legend-dot lost" />Loss</span>
        <span className="cal-legend-item"><span className="cal-legend-dot unattempted" />Unattempted</span>
      </div>
    </div>
  );
}

export default function Stats({ onClose }) {
  const stats = getStats();
  const winPct = stats.played > 0
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;

  const maxDist = Math.max(...stats.distribution, 1);

  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-panel stats-panel" onClick={e => e.stopPropagation()}>

        <button className="htp-close" onClick={onClose} aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </button>

        <h2 className="htp-title">Statistics</h2>

        {/* ── SUMMARY ROW ──────────────────────────────────── */}
        <div className="stats-summary">
          <div className="stats-box">
            <span className="stats-number">{stats.played}</span>
            <span className="stats-label">Played</span>
          </div>
          <div className="stats-box">
            <span className="stats-number">{winPct}</span>
            <span className="stats-label">Win %</span>
          </div>
          <div className="stats-box">
            <span className="stats-number">{stats.currentStreak}</span>
            <span className="stats-label">Current Streak</span>
          </div>
          <div className="stats-box">
            <span className="stats-number">{stats.maxStreak}</span>
            <span className="stats-label">Max Streak</span>
          </div>
        </div>

        <div className="htp-divider" />

        {/* ── GUESS DISTRIBUTION ───────────────────────────── */}
        <h3 className="htp-section-title">Guess Distribution</h3>
        <div className="stats-distribution">
          {stats.distribution.map((count, i) => (
            <div key={i} className="stats-dist-row">
              <span className="stats-dist-label">{i + 1}</span>
              <div className="stats-dist-bar-track">
                <div
                  className={`stats-dist-bar ${count > 0 ? 'filled' : ''}`}
                  style={{ width: `${Math.max((count / maxDist) * 100, 6)}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="htp-divider" />

        {/* ── CALENDAR HEATMAP ─────────────────────────────── */}
        <h3 className="htp-section-title">Activity</h3>
        <CalendarHeatmap />

      </div>
    </div>
  );
}
