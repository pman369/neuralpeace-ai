# NeuralPeace AI

An expert-level neuroscience AI assistant that provides adaptive, ethically-grounded explanations from novice to scholar levels.

## Features

- 🧠 **Adaptive Expertise**: Responses adjust from novice to scholar level (Novice, Practitioner, Expert, Scholar).
- 📚 **Peer-Reviewed Citations**: All claims backed by real-time citations via Perplexity AI.
- ⚖️ **Ethical Guardrails**: Built-in detection for medical advice with mandatory educational disclaimers.
- 📖 **Knowledge Modules**: Structured learning library across Neuroanatomy, Methods, Computational models, etc.
- 🤖 **Supabase Powered**: Uses Supabase Edge Functions for secure AI orchestration and Postgres for knowledge storage.
- 🧠 **3D Brain Atlas**: Integrated interactive brain visualization for spatial context.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Three.js, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Vector search).
- **AI**: Perplexity API (Sonar models) and GTE-small embeddings.

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional for local development)
- Perplexity API key

### Frontend Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Environment Variables**:
    Create `.env.local` in the `frontend` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

### Backend (Supabase) Setup

The backend logic is contained in Supabase Edge Functions.

1.  **Deploy Functions**:
    ```bash
    supabase functions deploy chat
    supabase functions deploy embed-knowledge
    ```
2.  **Set Secrets**:
    ```bash
    supabase secrets set PERPLEXITY_API_KEY=your_key
    supabase secrets set PERPLEXITY_MODEL=sonar
    ```

## Project Structure

```
neuralpeace/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # Modular UI (BrainAtlas, Chat, etc.)
│   │   ├── pages/       # Application views
│   │   └── lib/         # Supabase & AI logic
├── supabase/             # Backend infrastructure
│   ├── functions/       # Edge Functions (Deno)
│   └── migrations/      # Database schema & RLS
└── knowledge_base/       # Curated neuroscience content (Markdown)
```

## License

MIT License - See LICENSE file for details

---
**Version:** 0.2.0  
**Date:** April 18, 2026
