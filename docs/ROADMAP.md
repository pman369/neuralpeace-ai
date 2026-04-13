# 🚀 NeuralPeace AI: Implementation Roadmap

This roadmap outlines the phased implementation of features to transition NeuralPeace AI from a prototype to a production-grade neuroscience platform.

---

## Phase 1: Foundation & Security (Immediate)
*Goal: Secure user data and streamline the development workflow.*

- [x] **RLS Hardening**: Update Supabase migrations to restrict `chat_sessions` and `chat_messages` access using `auth.uid()`.
- [x] **Content-as-Code Sync**: Create a script to sync `knowledge_base/*.md` files directly to the Supabase `modules` table.
- [x] **Environment Cleanup**: Remove unused dependencies (e.g., `@google/genai`) and update configuration templates.

## Phase 2: Performance & UX Optimization (Short-term)
*Goal: Improve responsiveness and interactivity.*

- [x] **AI Response Streaming**: Implement Server-Sent Events (SSE) for Perplexity API responses to reduce perceived latency.
- [x] **Intelligent Caching**: Add an edge-level cache (Redis/DB) for common queries based on expertise level.
- [x] **Responsive Design Audit**: Ensure the "Bento Grid" and sidebar layouts are fully optimized for tablets and mobile devices.

## Phase 3: Research Intelligence (Medium-term)
*Goal: Enhance academic depth and factual reliability.*

- [x] **Hybrid RAG System**: Implement `pgvector` in Supabase to augment AI responses with curated local knowledge.
- [x] **Interactive Citation Panel**: Integrate the Semantic Scholar API to provide real-time paper summaries and DOI verification.
- [x] **Adaptive Onboarding**: Replace the static selector with an AI-driven knowledge baseline assessment.

## Phase 4: Visualization & Advanced Features (Long-term)
*Goal: Provide unique value through immersive data.*

- [x] **3D Brain Atlas**: Integrate a Three.js-based anatomical model that syncs with chat topics.
- [ ] **Collaboration Mode**: Allow users to share specific chat sessions or curated "Neural Paths" with others.
- [ ] **Offline Knowledge Mode**: Enable basic module reading via PWA (Progressive Web App) capabilities.

---

## 🛠 Status Dashboard
| Feature | Status | Target Date |
| :--- | :--- | :--- |
| Port Configuration | ✅ Done | Apr 12, 2026 |
| RLS Security | ✅ Done | Apr 12, 2026 |
| Content-as-Code Sync | ✅ Done | Apr 12, 2026 |
| AI Streaming | ✅ Done | Apr 12, 2026 |
| Intelligent Caching | ✅ Done | Apr 12, 2026 |
| Responsive Audit | ✅ Done | Apr 12, 2026 |
| Hybrid RAG System | ✅ Done | Apr 13, 2026 |
| Interactive Citations| ✅ Done | Apr 13, 2026 |
| Adaptive Onboarding | ✅ Done | Apr 13, 2026 |
| 3D Brain Atlas | ✅ Done | Apr 13, 2026 |
| Collaboration Mode | 🔄 Next | Apr 18, 2026 |
