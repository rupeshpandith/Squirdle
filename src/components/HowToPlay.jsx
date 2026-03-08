// How to Play instructions modal
// Shows game rules with example tiles

const EXAMPLES = [
  {
    word: [
      { letter: 'W', status: 'correct' },
      { letter: 'E', status: '' },
      { letter: 'A', status: '' },
      { letter: 'R', status: '' },
      { letter: 'Y', status: '' },
    ],
    description: 'W is in the word and in the correct spot.',
  },
  {
    word: [
      { letter: 'P', status: '' },
      { letter: 'I', status: 'present' },
      { letter: 'L', status: '' },
      { letter: 'L', status: '' },
      { letter: 'S', status: '' },
    ],
    description: 'I is in the word but in the wrong spot.',
  },
  {
    word: [
      { letter: 'V', status: '' },
      { letter: 'A', status: '' },
      { letter: 'G', status: '' },
      { letter: 'U', status: 'absent' },
      { letter: 'E', status: '' },
    ],
    description: 'U is not in the word in any spot.',
  },
];

export default function HowToPlay({ onClose }) {
  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-panel" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button className="htp-close" onClick={onClose} aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </button>

        <h2 className="htp-title">How To Play</h2>
        <p className="htp-subtitle">Guess the Squirdle in 6 tries.</p>

        <div className="htp-divider" />

        <ul className="htp-rules">
          <li>Each guess must be a valid 5-letter word.</li>
          <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>

        <div className="htp-divider" />

        <h3 className="htp-section-title">Examples</h3>

        {EXAMPLES.map((example, i) => (
          <div key={i} className="htp-example">
            <div className="htp-example-tiles">
              {example.word.map(({ letter, status }, j) => (
                <span
                  key={j}
                  className={`htp-tile ${status}`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="htp-example-desc">{example.description}</p>
          </div>
        ))}

        <div className="htp-divider" />

        <p className="htp-footer-note">
          A new puzzle is released daily at midnight. Come back every day for a new challenge!
        </p>

      </div>
    </div>
  );
}
