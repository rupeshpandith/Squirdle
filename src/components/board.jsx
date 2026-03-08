//grid of word tiles (6x5)
//it's job is to loop through each row, and figure out what each row will display and render a row of 5 tiles each

/*
The 3 types of ROW board must handle
1: PAST ROW -> already guessed, has evaluated tiles
2: CURRENT ROW -> player is typing in this row right now
3: FUTURE ROW -> hasn't been played yet, empty

board recieves 'currentRow'(0-5) to determine which type row is 

### HOW BOARD HANDLES EACH ROW's DATA
-for each row board will produce this data of 5 objects like{letter: 'A' , status: 'correct'}, and pass it to the tile.
*/
import Tile from './Tile'

export default function Board({ guesses, currentGuess, currentRow, invalidGuess, isBouncing }) {
  
  return (
    <div className="board">
      {Array(6).fill(null).map((_, rowIndex) => {

        const isPastRow = rowIndex < currentRow;
        const isCurrentRow = rowIndex === currentRow;
        
        let rowTiles;

        if (isPastRow) {
          rowTiles = guesses[rowIndex];
        } else if (isCurrentRow) {
          rowTiles = Array(5).fill(null).map((_, colIndex) => ({
            letter: currentGuess[colIndex] || '',
            status: '',
          }));
        } else {
          rowTiles = Array(5).fill({ letter: '', status: '' });
        }

        const isRevealing = isPastRow && rowIndex === currentRow - 1;
        const shouldShake = isCurrentRow && invalidGuess;

        // Bounce animation on the winning row after flip completes
        const isWinRow = isBouncing && isPastRow && rowIndex === currentRow - 1;

        return (
          <div
            key={rowIndex}
            className={`board-row ${shouldShake ? 'shake' : ''}`}
          >
            {rowTiles.map((tile, colIndex) => (
              <Tile
                key={colIndex}
                letter={tile.letter}
                status={tile.status}
                isRevealing={isRevealing}
                revealDelay={colIndex * 300}
                isBouncing={isWinRow}
                bounceDelay={colIndex * 100}
              />
            ))}
          </div>
        );
      })}

    </div>
  );
}