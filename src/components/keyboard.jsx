//on-screen keyboard layout
/*
### What we're doing
Building the on-screen keyboard — three rows of keys that the player can tap (on mobile) or click. Each key must show its color status (green/yellow/grey) based on letters already guessed.

### The Keyboard Layout

Real Wordle uses this QWERTY layout across 3 rows:
```
Row 1:  Q W E R T Y U I O P
Row 2:  A S D F G H J K L
Row 3:  ENTER  Z X C V B N M  ⌫
*/

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

export default function Keyboard({ usedLetters, onKey}) {
  return (
    <div className="keyboard">

      {KEYBOARD_ROWS.map((row, rowIndex) => (

        <div key={rowIndex} className={`keyboard-row ${rowIndex === 1 ? 'keyboard-row-middle' : ''}`}>

          {row.map((key) => {

            const keyStatus = usedLetters[key] || '';
            const isWide = key === 'ENTER' || key === '⌫';

            return (
              <button
                key={key}
                className={`key ${isWide ? 'key-wide' : ''} ${keyStatus}`}

                onClick={() => onKey(key)}

                onTouchEnd={(e) => {
                  e.preventDefault();
                  onKey(key);
                }}
              >
                {key === '⌫' ? (
                  <span className="material-symbols-rounded backspace-icon">backspace</span>
                ) : (
                  key
                )}
              </button>
            );
          })}

        </div>
      ))}

    </div>
  );
}

// ── HOW KEY COLORS WORK ───────────────────────────────────────────────
//
// usedLetters starts as {} (empty object)
//
// After guessing "CRANE" where C is correct, R is present, A is absent:
// usedLetters = { C: 'correct', R: 'present', A: 'absent', N: 'correct', E: 'correct' }
//
// The C key gets className="key correct" → renders green
// The R key gets className="key present" → renders yellow
// The A key gets className="key absent"  → renders grey
// All other keys → className="key" → default grey (unused)