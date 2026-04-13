import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import RoastDisplay from './components/RoastDisplay';
import LoadingState from './components/LoadingState';
import { fetchRandomMeal, type Meal } from './services/mealApi';
import { generateRamsayRoast, checkServerProxy } from './services/groqApi';
import { playDramaticSlam, playErrorSound } from './utils/sound';
import './App.css';

type AppStage = 'idle' | 'fetching' | 'recipe-loaded' | 'roasting' | 'roasted' | 'error';

interface AppState {
  stage: AppStage;
  meal: Meal | null;
  roast: string | null;
  error: string | null;
  isShaking: boolean;
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('groq_api_key') || '';
  });

  // Whether the server proxy is available (checked on mount)
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  const [state, setState] = useState<AppState>({
    stage: 'idle',
    meal: null,
    roast: null,
    error: null,
    isShaking: false,
  });

  const [roastCount, setRoastCount] = useState(0);

  // Check if server proxy is available on mount
  useEffect(() => {
    checkServerProxy().then(setServerAvailable);
  }, []);

  // Can we roast? Either server proxy is available, or user has their own key
  const canRoast = serverAvailable || !!apiKey;

  const handleApiKeySubmit = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
  }, []);

  const handleClearApiKey = useCallback(() => {
    setApiKey('');
    localStorage.removeItem('groq_api_key');
  }, []);

  /**
   * Main flow: Fetch random recipe → Show it → Roast it
   */
  const handleGetRoasted = useCallback(async () => {
    if (!canRoast) {
      setState(prev => ({ ...prev, stage: 'error', error: 'No API key available! Click "Use Your Own Key" to enter your Groq API key, you donut! 🍩' }));
      return;
    }

    // Step 1: Fetch random recipe
    setState({ stage: 'fetching', meal: null, roast: null, error: null, isShaking: false });

    let meal: Meal;
    try {
      meal = await fetchRandomMeal();
    } catch (err) {
      playErrorSound();
      setState(prev => ({ 
        ...prev, 
        stage: 'error', 
        error: `Failed to fetch recipe: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }));
      return;
    }

    // Step 2: Show the recipe
    setState({ stage: 'recipe-loaded', meal, roast: null, error: null, isShaking: false });

    // Brief pause for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 3: Start the roast
    setState(prev => ({ ...prev, stage: 'roasting', isShaking: true }));
    playDramaticSlam();

    // Stop shaking after a moment
    setTimeout(() => {
      setState(prev => ({ ...prev, isShaking: false }));
    }, 600);

    try {
      const roastText = await generateRamsayRoast(meal, apiKey);
      setState(prev => ({ ...prev, stage: 'roasted', roast: roastText }));
      setRoastCount(prev => prev + 1);
    } catch (err) {
      playErrorSound();
      setState(prev => ({ 
        ...prev, 
        stage: 'error', 
        roast: null,
        error: err instanceof Error ? err.message : 'Chef Ramsay was too angry to respond.' 
      }));
    }
  }, [apiKey, canRoast]);

  /**
   * Just fetch a new recipe without roasting
   */
  const handleNewRecipe = useCallback(async () => {
    setState({ stage: 'fetching', meal: null, roast: null, error: null, isShaking: false });

    try {
      const meal = await fetchRandomMeal();
      setState({ stage: 'recipe-loaded', meal, roast: null, error: null, isShaking: false });
    } catch (err) {
      playErrorSound();
      setState(prev => ({ 
        ...prev, 
        stage: 'error', 
        error: `Failed to fetch recipe: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }));
    }
  }, []);

  /**
   * Roast the currently loaded recipe again (or for the first time)
   */
  const handleRoastThis = useCallback(async () => {
    if (!state.meal || !canRoast) return;

    setState(prev => ({ ...prev, stage: 'roasting', roast: null, isShaking: true }));
    playDramaticSlam();

    setTimeout(() => {
      setState(prev => ({ ...prev, isShaking: false }));
    }, 600);

    try {
      const roastText = await generateRamsayRoast(state.meal, apiKey);
      setState(prev => ({ ...prev, stage: 'roasted', roast: roastText }));
      setRoastCount(prev => prev + 1);
    } catch (err) {
      playErrorSound();
      setState(prev => ({ 
        ...prev, 
        stage: 'error',
        error: err instanceof Error ? err.message : 'Chef Ramsay was too angry to respond.' 
      }));
    }
  }, [state.meal, apiKey, canRoast]);

  const isLoading = state.stage === 'fetching' || state.stage === 'roasting';

  return (
    <div className="app">
      <Header 
        onApiKeySubmit={handleApiKeySubmit} 
        onClearApiKey={handleClearApiKey}
        hasApiKey={!!apiKey} 
        serverAvailable={serverAvailable}
      />

      <main className="app__main">
        {/* Action Buttons */}
        <section className="app__actions" id="action-section">
          <button
            className="btn btn--primary btn--lg"
            onClick={handleGetRoasted}
            disabled={isLoading}
            id="get-roasted-btn"
          >
            {isLoading ? (
              <>
                <span className="btn__spinner" />
                {state.stage === 'fetching' ? 'Finding victim...' : 'Ramsay is typing...'}
              </>
            ) : (
              <>
                🔥 {state.meal ? 'NEW VICTIM' : 'GET A RECIPE ROASTED'} 🔥
              </>
            )}
          </button>

          {state.meal && !isLoading && (
            <div className="app__secondary-actions animate-in">
              <button
                className="btn btn--secondary"
                onClick={handleNewRecipe}
                id="new-recipe-btn"
              >
                🎲 Different Recipe
              </button>
              <button
                className="btn btn--danger"
                onClick={handleRoastThis}
                disabled={!canRoast}
                id="roast-again-btn"
              >
                😤 Roast This Again
              </button>
            </div>
          )}

          {roastCount > 0 && (
            <div className="app__counter">
              Recipes destroyed: <span className="app__counter-num">{roastCount}</span>
            </div>
          )}
        </section>

        {/* Error Display */}
        {state.error && (
          <section className="app__error animate-in" id="error-display">
            <div className="error-card">
              <span className="error-card__emoji">💀</span>
              <h3 className="error-card__title">KITCHEN NIGHTMARE</h3>
              <p className="error-card__message">{state.error}</p>
              <button 
                className="btn btn--secondary"
                onClick={() => setState(prev => ({ ...prev, stage: state.meal ? 'recipe-loaded' : 'idle', error: null }))}
                id="dismiss-error-btn"
              >
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Loading State */}
        {(state.stage === 'fetching' || state.stage === 'roasting') && (
          <LoadingState stage={state.stage} />
        )}

        {/* Content Grid */}
        {state.meal && state.stage !== 'fetching' && (
          <section className="app__content" id="content-section">
            <div className="app__grid">
              {/* Recipe Card */}
              <div className="app__recipe-col">
                <RecipeCard meal={state.meal} isShaking={state.isShaking} />
              </div>

              {/* Roast Display */}
              <div className="app__roast-col">
                {state.stage === 'roasting' && (
                  <LoadingState stage="roasting" />
                )}
                {state.roast && state.stage === 'roasted' && (
                  <RoastDisplay roastText={state.roast} />
                )}
                {state.stage === 'recipe-loaded' && (
                  <div className="app__waiting-roast animate-in" id="waiting-for-roast">
                    <span className="app__waiting-emoji">👨‍🍳</span>
                    <p className="app__waiting-text">
                      Chef Ramsay is waiting to review this dish...
                    </p>
                    <button 
                      className="btn btn--danger btn--lg"
                      onClick={handleRoastThis}
                      disabled={!canRoast}
                      id="unleash-ramsay-btn"
                    >
                      🔥 UNLEASH RAMSAY 🔥
                    </button>
                    {!canRoast && (
                      <p className="app__waiting-hint">
                        Use your own Groq API key to get started!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Idle State */}
        {state.stage === 'idle' && (
          <section className="app__idle animate-in" id="idle-section">
            <div className="app__idle-content">
              <div className="app__idle-emojis">
                <span>🍳</span><span>🔪</span><span>😤</span><span>🔥</span><span>💀</span>
              </div>
              <h2 className="app__idle-title">Ready for Verbal Destruction?</h2>
              <p className="app__idle-desc">
                Hit the button above to pull a random recipe from TheMealDB 
                and watch Chef Ramsay tear it apart with zero mercy. 
                Every roast is unique, AI-generated, and absolutely brutal.
              </p>
              <div className="app__idle-features">
                <div className="app__feature">
                  <span className="app__feature-icon">🎲</span>
                  <span className="app__feature-text">Random recipes from TheMealDB</span>
                </div>
                <div className="app__feature">
                  <span className="app__feature-icon">🤖</span>
                  <span className="app__feature-text">AI roasts powered by Groq</span>
                </div>
                <div className="app__feature">
                  <span className="app__feature-icon">🔇</span>
                  <span className="app__feature-text">Interactive bleep buttons</span>
                </div>
                <div className="app__feature">
                  <span className="app__feature-icon">🤬</span>
                  <span className="app__feature-text">Zero mercy guaranteed</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app__footer" id="footer">
        <p className="app__footer-text">
          Built with 🔥 and zero patience • 
          Powered by <a href="https://www.themealdb.com/" target="_blank" rel="noopener noreferrer">TheMealDB</a> & 
          <a href="https://groq.com/" target="_blank" rel="noopener noreferrer"> Groq</a>
        </p>
        <p className="app__footer-disclaimer">
          No actual chefs were harmed. All recipes were emotionally devastated.
        </p>
      </footer>
    </div>
  );
}
