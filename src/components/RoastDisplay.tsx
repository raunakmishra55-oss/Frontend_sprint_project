import { useState, useCallback, useMemo, useRef } from 'react';
import { playBleepSound } from '../utils/sound';
import './RoastDisplay.css';

interface RoastDisplayProps {
  roastText: string;
}

interface TextSegment {
  type: 'text' | 'bleep';
  content: string;
  id: number;
}

/**
 * Parse the roast text and split it into normal text and [BLEEP] segments.
 */
function parseRoastText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\[BLEEP\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let id = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the bleep
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
        id: id++,
      });
    }
    // Add the bleep
    segments.push({
      type: 'bleep',
      content: match[0],
      id: id++,
    });
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
      id: id++,
    });
  }

  return segments;
}

function BleepButton({ id }: { id: number }) {
  const [isBleeped, setIsBleeped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleBleep = useCallback(() => {
    playBleepSound();
    setIsBleeped(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsBleeped(false);
    }, 400);
  }, []);

  return (
    <button
      className={`bleep-btn ${isBleeped ? 'bleep-btn--active' : ''}`}
      onClick={handleBleep}
      id={`bleep-btn-${id}`}
      title="Click to bleep! 📢"
      aria-label="Bleep censor sound effect"
    >
      <span className="bleep-btn__text">
        {isBleeped ? '🔊 ████' : '🤬 ████'}
      </span>
    </button>
  );
}

export default function RoastDisplay({ roastText }: RoastDisplayProps) {
  const segments = useMemo(() => parseRoastText(roastText), [roastText]);
  const bleepCount = useMemo(() => segments.filter(s => s.type === 'bleep').length, [segments]);

  return (
    <div className="roast-display animate-in" id="roast-display">
      <div className="roast-display__header">
        <div className="roast-display__avatar">
          <span className="roast-display__avatar-emoji">👨‍🍳</span>
          <span className="roast-display__avatar-fire">🔥</span>
        </div>
        <div className="roast-display__meta">
          <h3 className="roast-display__chef-name">Chef Ramsay</h3>
          <span className="roast-display__mood">Mood: ABSOLUTELY LIVID 😤</span>
        </div>
        <div className="roast-display__rating">
          <span className="roast-display__rating-label">Rating</span>
          <span className="roast-display__rating-value">0/10</span>
        </div>
      </div>

      <div className="roast-display__content">
        <div className="roast-display__quote-mark">"</div>
        <div className="roast-display__text">
          {segments.map((segment) => {
            if (segment.type === 'bleep') {
              return <BleepButton key={segment.id} id={segment.id} />;
            }
            // Preserve line breaks in text segments
            return segment.content.split('\n').map((line, lineIdx, arr) => (
              <span key={`${segment.id}-${lineIdx}`}>
                {line}
                {lineIdx < arr.length - 1 && <br />}
              </span>
            ));
          })}
        </div>
        <div className="roast-display__quote-mark roast-display__quote-mark--end">"</div>
      </div>

      <div className="roast-display__footer">
        <div className="roast-display__bleep-count">
          🔇 {bleepCount} censor{bleepCount !== 1 ? 's' : ''} needed for broadcast
        </div>
        <div className="roast-display__disclaimer">
          Click the ████ buttons to hear the bleep! 📢
        </div>
      </div>
    </div>
  );
}
