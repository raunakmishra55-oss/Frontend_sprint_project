Live link: https://frontend-sprint-project-1.vercel.app/

# 🔥 Gordon Ramsay's Kitchen Trauma

> Get a random recipe. Watch it get absolutely **DEMOLISHED** by an AI Gordon Ramsay. No recipe is safe. No feelings are spared.

## 🍽️ What Is This?

A web app that fetches random recipes from [TheMealDB](https://www.themealdb.com/) and feeds them to an AI version of Gordon Ramsay (powered by [Groq](https://groq.com/)) who absolutely **roasts** them with zero mercy.

### Features

- 🎲 **Random Recipe Generator** — Pull recipes from TheMealDB's extensive database
- 🤖 **AI-Powered Roasts** — Groq's LLama 3.3 70B generates savage, hilarious Gordon Ramsay monologues
- 🔇 **Interactive Bleep Buttons** — Censored words become clickable buttons that play a TV censor bleep sound (Web Audio API — no audio files!)
- 🔥 **Hell's Kitchen Dark Theme** — Fire gradients, dramatic animations, and shake effects
- 📱 **Fully Responsive** — Looks great on desktop and mobile
- 🔐 **Secure API Handling** — Server-side proxy keeps the Groq API key safe; optional "bring your own key" fallback


## 🏗️ Architecture

```
┌────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Frontend     │────►│  /api/roast      │────►│   Groq API    │
│   (React+Vite) │     │  (Vercel Fn)     │     │  (LLama 3.3)  │
│                │     │  Rate Limited    │     │               │
│   TheMealDB ◄──│     │  GROQ_API_KEY    │     │               │
│   (Random API) │     │  (server-side)   │     │               │
└────────────────┘     └──────────────────┘     └───────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Vanilla CSS with custom properties |
| Sound FX | Web Audio API (no audio files) |
| Recipes API | TheMealDB |
| AI/LLM | Groq (LLama 3.3 70B Versatile) |
| Backend Proxy | Vercel Serverless Functions |
| Deployment | Vercel |

### Project Structure

```
├── api/
│   └── roast.ts              # Vercel serverless function (Groq proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.tsx/css     # Title, API key input, status
│   │   ├── RecipeCard.tsx/css # Recipe display with "TODAY'S VICTIM"
│   │   ├── RoastDisplay.tsx/css # Roast text with BLEEP buttons
│   │   └── LoadingState.tsx/css # Animated loading states
│   ├── services/
│   │   ├── mealApi.ts         # TheMealDB API client
│   │   └── groqApi.ts         # Groq API (proxy-first, direct fallback)
│   ├── utils/
│   │   └── sound.ts           # Web Audio API bleep/slam sounds
│   ├── App.tsx/css             # Main application
│   ├── index.css               # Design system & global styles
│   └── main.tsx                # Entry point
├── vercel.json                 # Vercel deployment config
├── .env.example                # Environment variable template
└── package.json
```

## 🔐 Security

- **Server-side API key** — The Groq API key is stored as a Vercel environment variable, never exposed to the frontend
- **Rate limiting** — The serverless proxy limits requests to 10 per minute per IP
- **Optional BYO key** — Users can optionally use their own Groq key (stored in their browser's localStorage, never sent to your server)

*No actual chefs were harmed. All recipes were emotionally devastated.* 🍳🔥
