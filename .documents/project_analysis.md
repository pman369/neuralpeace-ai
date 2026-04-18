# Project Analysis: NeuralPeace AI

NeuralPeace AI is a sophisticated, expert-level neuroscience AI assistant built with a modern web stack. It features adaptive expertise levels, ethically-grounded explanations, and a robust RAG (Retrieval-Augmented Generation) system integrated with a curated knowledge base.

## 1. Architecture & Technology Stack

The project follows a modern **Full-Stack Serverless** architecture.

### **Frontend**
- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **3D Visualization**: [Three.js](https://threejs.org/) with [React Three Fiber](https://r3f.docs.pmnd.rs/) for the integrated Brain Atlas.
- **Iconography**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context (Auth, Theme)

### **Backend & Infrastructure**
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL with `pgvector` for embedding support.
- **Auth**: Supabase Auth (Magic Links, OAuth)
- **Functions**: Supabase Edge Functions (Deno runtime)
- **AI Integration**: Perplexity API (Sonar models) and built-in Transformers (GTE-small) via `Supabase.ai`.

---

## 2. Codebase Structure & Main Components

### **Source Directory Layout (`frontend/src`)**
- `components/`: Modular UI elements (e.g., `BrainAtlas`, `ChatInput`, `CitationPanel`).
- `pages/`: Main application views (e.g., `ChatPage`, `ModuleLibrary`, `SettingsPage`).
- `lib/`: Core logic, API wrappers, and utilities (e.g., `ai.ts`, `database.ts`, `auth.ts`).
- `types.ts`: Global TypeScript definitions.

### **Backend Layout (`supabase/`)**
- `functions/`: Edge functions for `chat` (orchestration) and `embed-knowledge` (RAG).
- `migrations/`: SQL migration files defining the schema and seed data.
- `seed.sql`: Initial data for modules and content.

### **Knowledge Base (`knowledge_base/`)**
- Curated markdown files reflecting core neuroscience concepts.
- `sync_knowledge.py`: Python script for parsing markdown and generating SQL sync scripts.

---

## 3. Core Interactions & Performance

### **AI Assistant Flow**
1. User sends a message via `ChatPage`.
2. `ChatPage` calls the `chat` Edge Function.
3. **RAG Search**: The function performs a keyword-based search (and potentially vector search) against the `module_content` table.
4. **Context Injection**: Retrieved knowledge is injected into the system prompt.
5. **Adaptive Prompting**: Expertise levels (Novice to Scholar) determine the complexity of the response.
6. **Ethical Guardrails**: Medical keywords trigger mandatory disclaimers.
7. **Streaming Response**: Perplexity API streams the response back to the client.
8. **Caching**: Responses are cached for 24 hours to optimize costs and latency.

### **3D Brain Atlas**
- Integrated into the `BrainAtlas.tsx` component.
- Provides a spatial context for neuroscience concepts, enhancing the educational experience.

---

## 4. Evaluation & Assessment

### **Code Quality**
- **Pros**: Strong type safety with TypeScript, modular component design, clean separation of concerns between frontend and edge functions.
- **Cons**: Excessive use of `any` in some Edge Function response handling; local types and migrations are slightly out of sync with code references (e.g., missing `query_cache` migration).

### **Security**
- **Pros**: RLS (Row Level Security) is enabled on all core tables. Medical guardrails are hardcoded into the system prompt logic.
- **Cons**: Most RLS policies are currently "public read-only" or "anonymous insert", which is acceptable for dev but needs hardening for production.

### **Maintainability**
- **Pros**: Automated sync scripts for the knowledge base make it easy to update content via Markdown.
- **Cons**: The project README is outdated (references an Express `backend` directory that no longer exists).

### **Performance**
- **Pros**: Edge functions enable low-latency AI responses. Response caching is a major win for cost and speed.
- **Cons**: Keyword matching is less robust than semantic vector search (though infra for vector search is being built in).

---

## 5. Identified Technical Debt & Gaps

1.  **Schema Discrepancy**: Several tables (`query_cache`, `user_module_progress`) and RPCs (`keyword_match_module_content`) referenced in code are missing from the `supabase/migrations` folder.
2.  **Outdated Documentation**: The root `README.md` and `frontend/package.json` names (e.g., "react-example") need updating to reflect the current state of the project.
3.  **RLS Hardening**: Auth-bound policies need to be strictly enforced before production deployment.
4.  **Vector Search Integration**: The `embed-knowledge` function is present, but the `chat` function currently relies primarily on keyword matching.

---

## 6. Recommendations & Action Items

| Item | Description | Priority | Effort |
| :--- | :--- | :--- | :--- |
| **Sync DB Schema** | Create missing migrations for `query_cache`, `user_module_progress`, and the keyword match RPC. | **Critical** | Low |
| **Harden RLS** | Update policies to restrict write access to authenticated users only. | **High** | Medium |
| **Update README** | Reflect the Supabase-native architecture and remove references to the legacy Express backend. | **Medium** | Low |
| **Semantic RAG** | Fully transition from keyword matching to vector-based semantic search in the `chat` function. | **Medium** | Medium |
| **Type Generation** | Run `supabase gen types` to synchronize `database.types.ts` with the latest schema. | **High** | Low |
| **Error Boundaries** | Implement React Error Boundaries and robust logging in Edge Functions. | **Low** | Medium |

## 7. Next Steps

1.  **Immediate**: Fix the missing migration files to ensure a clean local setup.
2.  **Short Term**: Refine the `chat` function to use semantic embeddings for more accurate context retrieval.
3.  **Long Term**: Expand the `BrainAtlas` to interactively highlight regions discussed in the AI chat.

---
*Analysis conducted on 2026-04-17 by NeuralPeace Analysis Suite.*
