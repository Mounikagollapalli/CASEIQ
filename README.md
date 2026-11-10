# CaseIQ — AI-Powered Decision & Quality Assurance

CaseIQ is a document-driven case review platform. It combines PDF text extraction, transparent rule-based risk scoring, policy retrieval, optional AI-assisted explanations, and human review in one workflow.

> **Important:** CaseIQ is a decision-support prototype, not an automated legal, financial, employment, or compliance decision-maker. A human reviewer must make the final decision.

## Product workflow

1. Upload a text-based PDF.
2. Extract and save its text as a case.
3. Run explainable risk checks and identify missing information.
4. Retrieve relevant policy passages from the local policy library.
5. Optionally request an AI-written explanation when an OpenAI key is configured.
6. Review, approve, or reject the recommendation.
7. Monitor case volumes and review outcomes in Analytics.

## Features

- Dashboard with case and review KPIs
- Case search, status filters, and case details
- PDF upload, extraction, and analysis
- Rule-based risk score with a clear method label
- Policy search using TF-IDF retrieval
- Optional OpenAI explanation (never required for core workflow)
- Human approval/rejection with reviewer comments
- Analytics for risk distribution and review outcomes

## Tech stack

**Frontend:** React, Vite, Tailwind CSS, Axios  
**Backend:** Python, FastAPI, SQLAlchemy, SQLite  
**AI/ML:** scikit-learn, TF-IDF retrieval, optional OpenAI API  
**Documents:** pypdf

## Repository layout

```text
CaseIQ/
├── backendd/backend/     # FastAPI application and AI services
├── src/                  # Active React application
├── public/
├── package.json
└── README.md
```

The root `src/` directory is the active Vite frontend. `backendd/src/` is a legacy copy and is not used by the root Vite build.

## Run locally

### 1. Frontend

From the repository root:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### 2. Backend

In a second terminal:

```powershell
cd backendd/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs for the API documentation.

### 3. Optional OpenAI setup

Copy `.env.example` to `.env` inside `backendd/backend/` and add your own key:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Never commit `.env` or paste API keys into source code. Without a key, document extraction, rule-based risk analysis, policy retrieval, and human review remain available.

## API configuration

The frontend uses `VITE_API_URL` when set and otherwise defaults to `http://localhost:8000`.

For a deployed frontend, configure `VITE_API_URL` to the HTTPS URL of a separately hosted, persistent FastAPI backend. The current SQLite setup is intended for local development; serverless filesystems are ephemeral, so production deployment needs a persistent database.

## Quality checks

```bash
npm run lint
npm run build
```

## Limitations

- Scanned/image-only PDFs require OCR and are not currently supported.
- The baseline risk score is a transparent completeness heuristic, not a validated predictive model.
- Policy retrieval is TF-IDF keyword relevance, not embedding-based semantic search.
- SQLite is for local development/demo use.
- OpenAI explanations are optional and must be checked by a human.

## Developer

**Mounika Gollapalli**  
GitHub: https://github.com/Mounikagollapalli

*CaseIQ — Explainable insights. Human-led decisions.*

## Deployment

The Vercel project is connected to this GitHub repository. Preview deployments are intended for frontend review. The FastAPI API must be deployed separately with a persistent PostgreSQL database and matching CORS origins before the hosted workflow can process real documents.
