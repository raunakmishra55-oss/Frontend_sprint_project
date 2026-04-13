import { useState, useCallback } from 'react';
import './Header.css';

interface HeaderProps {
  onApiKeySubmit: (key: string) => void;
  onClearApiKey: () => void;
  hasApiKey: boolean;
  serverAvailable: boolean | null;
}

export default function Header({ onApiKeySubmit, onClearApiKey, hasApiKey, serverAvailable }: HeaderProps) {
  const [keyInput, setKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSubmitKey = useCallback(() => {
    if (keyInput.trim()) {
      onApiKeySubmit(keyInput.trim());
      setShowKeyInput(false);
      setKeyInput('');
    }
  }, [keyInput, onApiKeySubmit]);

  return (
    <header className="header" id="header">
      {/* Decorative flame particles */}
      <div className="header__flames">
        <span className="flame flame--1">🔥</span>
        <span className="flame flame--2">🔥</span>
        <span className="flame flame--3">🔥</span>
        <span className="flame flame--4">🔥</span>
        <span className="flame flame--5">🔥</span>
      </div>

      <div className="header__content">
        <div className="header__badge">⚠️ VIEWER DISCRETION ADVISED ⚠️</div>
        
        <h1 className="header__title">
          <span className="header__title-line1">GORDON RAMSAY'S</span>
          <span className="header__title-line2 fire-text">KITCHEN TRAUMA</span>
        </h1>

        <p className="header__subtitle">
          Get a random recipe. Watch it get absolutely <strong>DEMOLISHED</strong>. 
          <br />No recipe is safe. No feelings are spared. 🍴
        </p>

        {/* API Status */}
        <div className="header__api-section">
          {/* Server proxy is available — no key needed */}
          {serverAvailable && !hasApiKey && !showKeyInput && (
            <div className="header__api-status header__api-status--connected">
              <span className="status-dot status-dot--green" />
              Chef Ramsay is READY — Just hit the button!
              <button 
                className="header__change-key-btn"
                onClick={() => setShowKeyInput(true)}
                id="use-own-key-btn"
              >
                Use Your Own Key
              </button>
            </div>
          )}

          {/* Server proxy available + user also has key */}
          {serverAvailable && hasApiKey && !showKeyInput && (
            <div className="header__api-status header__api-status--connected">
              <span className="status-dot status-dot--green" />
              Chef Ramsay is READY (using your key as backup)
              <button 
                className="header__change-key-btn"
                onClick={onClearApiKey}
                id="clear-api-key-btn"
              >
                Remove Key
              </button>
            </div>
          )}

          {/* Server proxy NOT available — need user key */}
          {serverAvailable === false && !hasApiKey && !showKeyInput && (
            <button 
              className="header__connect-btn"
              onClick={() => setShowKeyInput(true)}
              id="connect-groq-btn"
            >
              🔑 Connect Your Groq API Key to Unleash Ramsay
            </button>
          )}

          {/* Server proxy NOT available but user has key */}
          {serverAvailable === false && hasApiKey && !showKeyInput && (
            <div className="header__api-status header__api-status--connected">
              <span className="status-dot status-dot--green" />
              Using your Groq API key — Chef Ramsay is READY
              <button 
                className="header__change-key-btn"
                onClick={() => setShowKeyInput(true)}
                id="change-api-key-btn"
              >
                Change Key
              </button>
            </div>
          )}

          {/* Still checking server... */}
          {serverAvailable === null && !hasApiKey && (
            <div className="header__api-status">
              <span className="status-dot" style={{ background: '#999' }} />
              Checking connection...
            </div>
          )}

          {/* API Key Input */}
          {showKeyInput && (
            <div className="header__key-input-group animate-in">
              <input
                type="password"
                className="header__key-input"
                placeholder="Enter your Groq API key..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitKey()}
                id="groq-api-key-input"
                autoFocus
              />
              <button 
                className="header__key-submit"
                onClick={handleSubmitKey}
                disabled={!keyInput.trim()}
                id="submit-api-key-btn"
              >
                🔥 Activate
              </button>
              <button 
                className="header__key-cancel"
                onClick={() => { setShowKeyInput(false); setKeyInput(''); }}
                id="cancel-api-key-btn"
              >
                ✕
              </button>
              <p className="header__key-hint">
                Get your free key at{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                  console.groq.com/keys
                </a>
                {serverAvailable && ' • Optional — server key is already configured'}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
