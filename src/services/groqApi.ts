// Groq LLM API service for Gordon Ramsay roasts
// Supports two modes:
//   1. Server proxy (/api/roast) — default, API key is server-side
//   2. Direct Groq API — fallback when user provides their own key

import type { Meal } from './mealApi';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface ProxyErrorResponse {
  error: string;
  useOwnKey?: boolean;
}

/**
 * Build the Gordon Ramsay prompt from a meal's data.
 */
function buildRamsayPrompt(meal: Meal): GroqMessage[] {
  // Pick two random ingredients for the "disgusting combo" focus
  const shuffled = [...meal.ingredients].sort(() => Math.random() - 0.5);
  const ingredient1 = shuffled[0] || 'mystery slop';
  const ingredient2 = shuffled[1] || 'sad leftovers';

  const ingredientList = meal.ingredients
    .map((ing, i) => `${meal.measures[i]} ${ing}`.trim())
    .join(', ');

  return [
    {
      role: 'system',
      content: `You are Gordon Ramsay — the world's most terrifyingly talented chef with ZERO patience and an legendary temper. You're reviewing amateur recipes and you are FURIOUS. Your responses should be:

- Absolutely savage but hilarious
- Full of creative, over-the-top insults (at least 3 creative insults)  
- Include some words that should be "bleeped" — wrap these censored words in [BLEEP] tags like: "This is absolutely [BLEEP]ing disgusting" or "You [BLEEP]ing donkey"
- Reference your famous catchphrases like "idiot sandwich", "it's RAW", "shut it down", "GET OUT"
- Include dramatic pauses with "..." and CAPS for yelling
- Be specific about WHY the recipe is terrible (even if it isn't — find something to complain about)
- End with a reluctant, backhanded compliment OR a final devastating insult
- Keep the response between 150-250 words — punchy and quotable
- Format as a dramatic monologue, like you're on Hell's Kitchen
- Use line breaks between major rant sections for dramatic effect`
    },
    {
      role: 'user',
      content: `Review this recipe for "${meal.strMeal}" (${meal.strArea} cuisine, category: ${meal.strCategory}).

INGREDIENTS: ${ingredientList}

INSTRUCTIONS: ${meal.strInstructions.substring(0, 500)}

Focus especially on how DISGUSTING the combination of "${ingredient1}" and "${ingredient2}" is together. This should be your Gordon Ramsay magnum opus of culinary destruction. GO!`
    }
  ];
}

/**
 * Try to generate roast via the server proxy (/api/roast).
 * Returns the roast text if successful, or throws with { useOwnKey: true } if server has no key.
 */
async function roastViaProxy(messages: GroqMessage[]): Promise<string> {
  const response = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData: ProxyErrorResponse = await response.json().catch(() => ({ error: 'Unknown proxy error' }));

    // If server says "useOwnKey", throw a special error so we can fall back
    if (errorData.useOwnKey) {
      const err = new Error(errorData.error);
      (err as Error & { useOwnKey: boolean }).useOwnKey = true;
      throw err;
    }

    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  const data: GroqResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Even the AI refused to respond to this culinary disaster.');
  }

  return data.choices[0].message.content;
}

/**
 * Generate roast by calling Groq directly with the user's own API key.
 */
async function roastDirectly(messages: GroqMessage[], apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.9,
      max_tokens: 1024,
      top_p: 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = (errorData as { error?: { message?: string } })?.error?.message || response.statusText;

    if (response.status === 401) {
      throw new Error('Invalid API key! Even your authentication is RAW! Get a proper Groq API key, you DONKEY!');
    }
    if (response.status === 429) {
      throw new Error('Rate limited! You\'ve been sending so many terrible recipes that even the servers need a break!');
    }
    throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
  }

  const data: GroqResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Even the AI refused to respond to this culinary disaster.');
  }

  return data.choices[0].message.content;
}

/**
 * Call the Groq API to generate a Gordon Ramsay roast.
 * 
 * Strategy:
 *   1. Try the server proxy first (/api/roast) — no user key needed
 *   2. If server has no API key configured, fall back to user's own key
 *   3. If no user key either, throw a helpful error
 */
export async function generateRamsayRoast(meal: Meal, apiKey: string): Promise<string> {
  const messages = buildRamsayPrompt(meal);

  // Try server proxy first
  try {
    return await roastViaProxy(messages);
  } catch (proxyErr) {
    const err = proxyErr as Error & { useOwnKey?: boolean };

    // If the server explicitly says "use your own key" and user has one, fall back
    if (err.useOwnKey && apiKey) {
      return await roastDirectly(messages, apiKey);
    }

    // If server says use own key but user has none, give a clear message
    if (err.useOwnKey && !apiKey) {
      throw new Error(
        'The server doesn\'t have an API key configured. Click "Use Your Own Key" in the header and enter your Groq API key to get started!'
      );
    }

    // For any other proxy error (rate limit, 500, etc.), re-throw
    throw err;
  }
}

/**
 * Check if the server proxy is available and has an API key configured.
 * Used to determine whether to show the "bring your own key" UI.
 */
export async function checkServerProxy(): Promise<boolean> {
  try {
    // Send a minimal OPTIONS-like check — the server will return 405 for GET
    // but we can check if /api/roast is reachable
    const response = await fetch('/api/roast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    // 400 = endpoint exists and has API key (just bad request body)
    // 503 = endpoint exists but no API key
    if (response.status === 400) return true;
    if (response.status === 503) {
      const data = await response.json().catch(() => ({}));
      return !(data as ProxyErrorResponse).useOwnKey;
    }

    return true;
  } catch {
    // Proxy not available (e.g. running locally without Vercel dev)
    return false;
  }
}
