// Game logic hook — manages guesses, keyboard state, persistence & stats

import { useState, useEffect, useCallback, useRef } from 'react'
import { evaluateGuess } from '../utils/evaluateGuess'
import { ANSWERS } from '../data/answers'
import { VALID_GUESSES } from '../data/validGuesses'


// ── DAILY WORD SELECTOR ─────────────────────────────────────────────
// Deterministic pseudo-random: (day × M + C) % N with M coprime to N.
// Same word for everyone on the same day; no repeats for ~6.3 years.

const WORD_COUNT = 2315;
const SCRAMBLE_M = 1103;
const SCRAMBLE_C = 37;

function getTodayStr() {
  return new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
}

export function getTodaysWord() {
  const startDate = new Date(2026, 2, 7); // anchor: March 7, 2026
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 864e5;
  const daysPassed = Math.floor((today - startDate) / msPerDay);
  const dayInCycle = ((daysPassed % WORD_COUNT) + WORD_COUNT) % WORD_COUNT;
  const wordIndex = (dayInCycle * SCRAMBLE_M + SCRAMBLE_C) % WORD_COUNT;

  return ANSWERS[wordIndex].toUpperCase();
}


// ── STATS HELPERS ───────────────────────────────────────────────────

const STATS_KEY = 'squirdle-stats';

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    // guess distribution: how many times won in 1,2,3,4,5,6 guesses
    distribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: null,
    lastWinDate: null,
  };
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getStats() {
  return loadStats();
}


// ── DAILY HISTORY (calendar heatmap) ────────────────────────────

const HISTORY_KEY = 'squirdle-history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {}; // { "2026-03-08": "won", "2026-03-07": "lost", ... }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory() {
  return loadHistory();
}


// ── GAME STATE PERSISTENCE ──────────────────────────────────────────

const STATE_KEY = 'squirdle-game-state';

function loadGameState(solution) {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Only restore if it's for today's word
    if (saved.solution !== solution) return null;
    return saved;
  } catch { return null; }
}

function saveGameState(solution, guesses, currentRow, gameStatus, usedLetters) {
  localStorage.setItem(STATE_KEY, JSON.stringify({
    solution,
    guesses,
    currentRow,
    gameStatus,
    usedLetters,
    date: getTodayStr(),
  }));
}


// ── MAIN HOOK ───────────────────────────────────────────────────────

export function useWordle() {
  const solution = getTodaysWord();
  const saved = loadGameState(solution);
  const statsRecorded = useRef(false);

  // STATE — restored from localStorage if available
  const [guesses, setGuesses] = useState(saved?.guesses ?? Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(saved?.currentRow ?? 0);
  const [gameStatus, setGameStatus] = useState(saved?.gameStatus ?? 'playing');
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [usedLetters, setUsedLetters] = useState(saved?.usedLetters ?? {});

  // true while the winning row is bouncing — delays modal
  const [isBouncing, setIsBouncing] = useState(false);
  // delays modal so flip animation finishes first (~1.8s)
  const [showModal, setShowModal] = useState(saved?.gameStatus && saved.gameStatus !== 'playing');

  // Persist game state on every change
  useEffect(() => {
    saveGameState(solution, guesses, currentRow, gameStatus, usedLetters);
  }, [solution, guesses, currentRow, gameStatus, usedLetters]);

  // Record stats once when game ends (not on restore)
  useEffect(() => {
    if (statsRecorded.current) return;
    if (gameStatus === 'playing') return;
    // Skip stats on restore — check if this status was already saved
    if (saved?.gameStatus === gameStatus) {
      statsRecorded.current = true;
      return;
    }
    statsRecorded.current = true;

    const stats = loadStats();
    const today = getTodayStr();

    // Don't double-count if already recorded today
    if (stats.lastPlayedDate === today) return;

    stats.played += 1;
    stats.lastPlayedDate = today;

    if (gameStatus === 'won') {
      stats.wins += 1;
      const guessCount = guesses.filter(g => g !== null).length;
      stats.distribution[guessCount - 1] = (stats.distribution[guessCount - 1] || 0) + 1;

      // Streak: consecutive days. Check if yesterday was last win.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');
      stats.currentStreak = (stats.lastWinDate === yesterdayStr)
        ? stats.currentStreak + 1
        : 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.lastWinDate = today;
    } else {
      stats.currentStreak = 0;
    }

    saveStats(stats);

    // Record daily result for calendar heatmap
    const history = loadHistory();
    history[today] = gameStatus; // "won" or "lost"
    saveHistory(history);
  }, [gameStatus, guesses, saved?.gameStatus]);


  // UPDATE KEYBOARD LETTER COLOUR
  function updateUsedLetters(evaluatedTiles) {
    setUsedLetters(prev => {
      const updated = { ...prev };
      const priority = { correct: 3, present: 2, absent: 1 };
      evaluatedTiles.forEach(({ letter, status }) => {
        const cur = updated[letter];
        if (!cur || priority[status] > priority[cur]) {
          updated[letter] = status;
        }
      });
      return updated;
    });
  }

  // SHAKE + TOAST (~1s visibility)
  function triggerShake(message = '') {
    setInvalidGuess(true);
    setToastMessage(message);
    setTimeout(() => {
      setInvalidGuess(false);
      setToastMessage('');
    }, 1000);
  }


  // KEY HANDLER
  const handleKey = useCallback((key) => {
    if (gameStatus !== 'playing') return;

    // ENTER
    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        triggerShake('Need 5 letters!');
        return;
      }

      const allValidWords = [...ANSWERS, ...VALID_GUESSES].map(w => w.toUpperCase());
      if (!allValidWords.includes(currentGuess)) {
        triggerShake('Not in word list');
        return;
      }

      const evaluated = evaluateGuess(currentGuess, solution);

      setGuesses(prev => {
        const updated = [...prev];
        updated[currentRow] = evaluated;
        return updated;
      });

      updateUsedLetters(evaluated);

      const won = currentGuess === solution;
      const lost = !won && currentRow === 5;

      if (won) {
        // Bounce the winning row, then show modal
        setIsBouncing(true);
        setTimeout(() => {
          setGameStatus('won');
          setIsBouncing(false);
          setShowModal(true);
        }, 2200); // flip ~1.5s + bounce ~0.7s
      } else if (lost) {
        setTimeout(() => {
          setGameStatus('lost');
          setShowModal(true);
        }, 1800); // wait for flip to finish
      }

      setCurrentRow(prev => prev + 1);
      setCurrentGuess('');
      return;
    }

    // BACKSPACE
    if (key === 'BACKSPACE' || key === '⌫') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    // LETTER KEY (A-Z)
    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }

  }, [currentGuess, currentRow, gameStatus, solution]);


  // PHYSICAL KEYBOARD LISTENER
  useEffect(() => {
    const onKeyDown = (e) => handleKey(e.key.toUpperCase());
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);


  return {
    solution,
    guesses,
    currentGuess,
    currentRow,
    gameStatus,
    invalidGuess,
    toastMessage,
    usedLetters,
    handleKey,
    showModal,
    isBouncing,
  };
}