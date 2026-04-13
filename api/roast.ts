import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST, you donkey!' });
  }

  // Check for server-side API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ 
      error: 'Server API key not configured.',
      useOwnKey: true
    });
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.socket?.remoteAddress 
    || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ 
      error: 'Rate limited! You\'ve been sending so many terrible recipes that even the servers need a break! Try again in a minute.' 
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body. Send { messages: [...] }' });
    }

    // Proxy to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      const errorMsg = (errorData as { error?: { message?: string } })?.error?.message || groqResponse.statusText;

      if (groqResponse.status === 429) {
        return res.status(429).json({ 
          error: 'Groq rate limited. Even the AI needs a breather from your culinary disasters!' 
        });
      }

      return res.status(groqResponse.status).json({ 
        error: `Groq API error: ${errorMsg}` 
      });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Roast API error:', err);
    return res.status(500).json({ 
      error: 'Internal server error. Chef Ramsay broke the kitchen.' 
    });
  }
}
