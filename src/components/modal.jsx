// Win/Lose modal

const WIN_MESSAGES = [
  'Genius!',
  'Magnificent!',
  'Impressive!',
  'Splendid!',
  'Great!',
  'Phew!',
];

export default function Modal({ status, solution, guesses, onExit }) {
  const usedRows = guesses.filter(g => g !== null).length;
  const winMessage = WIN_MESSAGES[usedRows - 1] || 'Nice!';

  return (
    <div className="modal-overlay">
      <div className="modal">

        {/* WIN STATE */}
        {status === 'won' && (
          <>
            <h2 className="modal-title">{winMessage}</h2>
            <p className="modal-subtitle">
              Solved in <strong>{usedRows}</strong> {usedRows === 1 ? 'guess' : 'guesses'}
            </p>
            <p className="modal-comeback">
              Come Again tomorrow for next Squirdle
            </p>
            <button className="modal-btn" onClick={onExit}>
              Exit
            </button>
          </>
        )}

        {/* LOSE STATE */}
        {status === 'lost' && (
          <>
            <h2 className="modal-title">Game Over</h2>
            <p className="modal-subtitle">
              The word was <strong className="solution-reveal">{solution}</strong>
            </p>
            <p className="modal-comeback">
              Come Again tomorrow for next Squirdle
            </p>
            <button className="modal-btn" onClick={onExit}>
              Exit
            </button>
          </>
        )}

      </div>
    </div>
  );
}