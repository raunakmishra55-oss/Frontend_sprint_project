import './LoadingState.css';

interface LoadingStateProps {
  stage: 'fetching' | 'roasting';
}

const messages = {
  fetching: [
    "Finding today's victim...",
    "Pulling a random recipe from the kitchen...",
    "Selecting a dish for destruction...",
  ],
  roasting: [
    "Chef Ramsay is reviewing the recipe...",
    "Preparing a verbal demolition...",
    "Heating up the insults...",  
    "This is going to be BRUTAL...",
  ],
};

export default function LoadingState({ stage }: LoadingStateProps) {
  const stageMessages = messages[stage];
  const message = stageMessages[Math.floor(Math.random() * stageMessages.length)];

  return (
    <div className="loading-state animate-in" id="loading-state">
      <div className="loading-state__container">
        {stage === 'fetching' ? (
          <div className="loading-state__plate">
            <span className="loading-state__plate-emoji">🍽️</span>
            <div className="loading-state__spinner" />
          </div>
        ) : (
          <div className="loading-state__rage">
            <span className="loading-state__rage-emoji">😤</span>
            <div className="loading-state__fire-ring">
              <span>🔥</span><span>🔥</span><span>🔥</span><span>🔥</span>
            </div>
          </div>
        )}

        <p className="loading-state__message">{message}</p>
        
        <div className="loading-state__bar-track">
          <div className={`loading-state__bar-fill loading-state__bar-fill--${stage}`} />
        </div>

        {stage === 'roasting' && (
          <p className="loading-state__warning">⚠️ Viewer discretion advised ⚠️</p>
        )}
      </div>
    </div>
  );
}
