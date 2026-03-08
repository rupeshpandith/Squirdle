// Single letter tile with flip and bounce animations
import { useState, useEffect } from 'react'

export default function Tile({
  letter = '', status = '', isRevealing = false, revealDelay = 0,
  isBouncing = false, bounceDelay = 0,
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      const timer = setTimeout(() => setRevealed(true), revealDelay);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, revealDelay]);

  const isFilled = letter !== '' && status === '';
  const isFlipping = isRevealing && !revealed;

  const tileClass = [
    'tile',
    isFilled ? 'filled' : '',
    isFlipping ? 'flipping' : '',
    revealed || (!isRevealing && status) ? status : '',
    isBouncing ? 'bouncing' : '',
  ].filter(Boolean).join(' ');

  const style = {};
  if (isRevealing) style.animationDelay = `${revealDelay}ms`;
  if (isBouncing) style.animationDelay = `${1500 + bounceDelay}ms`;

  return (
    <div className={tileClass} style={style}>
      {letter}
    </div>
  );
}