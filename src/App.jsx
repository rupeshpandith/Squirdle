import { useState, useEffect } from 'react';
import { useWordle } from './hooks/useWordle';
import Header from './components/Header';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import HomePage from './components/HomePage';
import { scheduleDailyReminder } from './utils/notifications';
import './App.css';

const THEME_KEY = 'squirdle-theme';

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch { return 'dark'; }
}

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [showHome, setShowHome] = useState(true);

  useEffect(() => {
    scheduleDailyReminder();
  }, []);

  function toggleTheme() {
    setTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }

  const {
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
  } = useWordle();

  function handleExit() {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.exitApp();
    } else {
      setShowHome(true);
    }
  }

  return (
    <div className={`app ${theme}`}>

      {showHome ? (
        <HomePage
          onPlay={() => setShowHome(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
          gameStatus={gameStatus}
        />
      ) : (
        <>
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            onBack={() => setShowHome(true)}
          />

          {toastMessage && (
            <div className="toast">
              {toastMessage}
            </div>
          )}

          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={currentRow}
            invalidGuess={invalidGuess}
            isBouncing={isBouncing}
          />

          <Keyboard
            usedLetters={usedLetters}
            onKey={handleKey}
          />

          {showModal && gameStatus !== 'playing' && (
            <Modal
              status={gameStatus}
              solution={solution}
              guesses={guesses}
              onExit={handleExit}
            />
          )}
        </>
      )}

    </div>
  );
}