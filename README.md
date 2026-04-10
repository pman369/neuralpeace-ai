# NeuralPeace AI

An expert-level neuroscience AI assistant that provides adaptive, ethically-grounded explanations from novice to expert levels.

## Features

- 🧠 **Adaptive Expertise**: Responses adjust from novice to expert level
- 📚 **Peer-Reviewed Citations**: All claims backed by credible sources
- ⚖️ **Ethical Guardrails**: Prevents medical advice, emphasizes educational use
- 🔗 **Interdisciplinary Links**: Connects neuroscience to AI, philosophy, genetics
- 📖 **Knowledge Modules**: Structured learning across core concepts and frontiers
- 🤖 **Powered by Perplexity AI**: Advanced LLM with real-time web search and citations

## Quick Start

### Prerequisites
- Node.js 18+
- Perplexity API key (get at https://www.perplexity.ai/settings/api)

### Backend Setup
```bash
cd backend
npm install
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux
```

Edit `backend/.env` and add your Perplexity API key.

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Variables
Create `backend/.env`:
```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_MODEL=sonar
PORT=8000
MAX_TOKENS=2000
TEMPERATURE=0.7
```

### Run Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
neuralpeace/
├── backend/
│   ├── server.js           # Express server with Perplexity API
│   ├── package.json        # Node.js dependencies
│   ├── .env.example        # Environment variables template
│   ├── test-api.js         # API endpoint tests
│   └── README.md           # Backend documentation
├── frontend/
│   ├── src/
│   ├── components/
│   └── public/
├── knowledge_base/
│   ├── core_concepts.md
│   ├── advanced_frontiers.md
│   └── neuroplasticity.md
└── docs/
```

## Knowledge Modules

1. **Core Concepts** - Neuroanatomy, imaging, computational neuroscience, diseases, ethics
2. **Advanced Frontiers** - Quantum biology, connectomics, organoid intelligence
3. **Neuroplasticity** - Molecular mechanisms, clinical interventions, computational models

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send query, get adaptive response |
| `/api/knowledge` | GET | List available knowledge modules |
| `/api/citations` | GET | Retrieve citations by topic |
| `/api/expertise` | POST | Set user expertise level |

## Testing

```bash
cd backend
pytest tests/ -v --cov=app
```

## License

MIT License - See LICENSE file for details

## Contact

NeuralPeace AI Project  
neuralpeace.ownai.com

---

**Version:** 0.1.0  
**Date:** March 5, 2026
