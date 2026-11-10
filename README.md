# CaseIQ — Document Intelligence & Human-Led Quality Assurance

**Explainable document checks · Policy retrieval · Human decisions**

CaseIQ is a full-stack decision-support prototype that turns text-based PDF documents into reviewable cases. It combines document extraction, document-type-aware completeness checks, policy passage retrieval, optional AI-assisted explanations, and a human review workflow.

CaseIQ is not an autonomous decision-maker. Its completeness indicators are operational prompts—not fraud scores, legal conclusions, or assessments of a person's trustworthiness. A human reviewer must verify the document and evidence before recording a decision.

## Live workspace

- **Application:** https://caseiq-git-professional-caseiq-mounika-f288.vercel.app/
- **Repository:** https://github.com/Mounikagollapalli/CASEIQ
- **Deployment:** Vercel
- **Database:** Neon PostgreSQL

## Core capabilities

- **PDF intake:** Validates PDF file type and size, extracts selectable text with PyPDF, and creates a persistent case.
- **Document-aware checks:** Identifies résumé, invoice, and agreement documents and checks only the configured fields relevant to that category.
- **Explainable completeness indicator:** Reports the proportion of configured fields not detected. Unrecognized document types are left unscored rather than being given a misleading generic score.
- **Policy knowledge:** Retrieves relevant local policy passages with TF-IDF and cosine similarity.
- **Optional AI explanation:** OpenAI integration can produce supporting natural-language explanations. The deterministic workflow remains available without an API key.
- **Human review:** Requires a reviewer comment before approval or rejection. The final decision remains with the reviewer.
- **Analytics:** Summarizes case volume, completeness categories, review outcomes, and a simple reviewer-alignment indicator.

## Document categories

| Category | Example completeness checks |
|---|---|
| Résumé | Name, email, phone, education, skills, experience, projects |
| Invoice | Invoice number/date, supplier, customer, total amount |
| Agreement | Parties, effective date, terms, signature section |
| Other / unclassified | No generic score; manual classification and review |

These checks use transparent text patterns. They do not verify whether information is true, authentic, legally sufficient, or complete in context. A detected field still needs human verification.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | Python, FastAPI, Pydantic |
| Database | Neon PostgreSQL, SQLAlchemy; SQLite local fallback |
| Document processing | PyPDF |
| Machine learning / retrieval | Scikit-learn, TF-IDF, cosine similarity |
| Optional generative AI | OpenAI API |
| Hosting | Vercel |
| Source control | Git, GitHub |

## Architecture

- `src/` — React frontend and reusable workspace components.
- `backendd/backend/main.py` — FastAPI routes and workflow orchestration.
- `backendd/backend/database.py` — SQLAlchemy models and database connection.
- `backendd/backend/ml_service.py` — document classification and deterministic completeness checks.
- `backendd/backend/rag_service.py` — TF-IDF policy retrieval.
- `backendd/backend/ai_service.py` — optional OpenAI explanation service.
- `backendd/backend/policies/` — local policy text sources.
- `vercel.json` — frontend and FastAPI service routing.

## Local development

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backendd/backend
python -m venv venv
```

Activate the environment, then install and run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend runs at `http://localhost:5173`; the API runs at `http://127.0.0.1:8000`.

## Environment variables

Configure these in the hosting provider's encrypted environment settings. Do not commit secret values.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `FRONTEND_ORIGINS` | Comma-separated allowed browser origins when using a separate frontend origin |
| `OPENAI_API_KEY` | Optional API key for AI-assisted explanations |
| `OPENAI_MODEL` | Optional model name; defaults to `gpt-4o-mini` |

For serverless deployments, use Neon's pooled connection string for normal application traffic. Use a direct connection for schema migrations.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| GET | `/dashboard/stats` | Dashboard metrics |
| GET | `/cases` | List cases |
| GET | `/cases/{case_id}` | Case details |
| POST | `/documents/upload` | Extract PDF and create case |
| POST | `/cases/{case_id}/analyze` | Run document-specific checks |
| GET | `/reviews/pending` | List pending human decisions |
| POST | `/reviews` | Save decision and required reviewer comment |
| POST | `/policies/search` | Search policy passages |
| GET | `/analytics` | Analytics summary |

## Known limitations

- Scanned/image-only PDFs need OCR and are not currently supported.
- Document classification and completeness checks are rule-based and can miss unusual layouts or wording.
- Policy retrieval only searches the policy text files included in the backend.
- Optional AI explanations depend on a configured API key and must be verified.
- Authentication, role-based access control, encrypted document storage, and a full audit log are future production-hardening tasks.
- The Random Forest training endpoint is intentionally not used for live scoring until a sufficiently large, representative, validated review dataset is available.

## Responsible AI

CaseIQ is a portfolio and workflow demonstration. Completeness indicators are not statistically validated risk predictions. No automated output should be used as the sole basis for employment, financial, legal, identity, or other consequential decisions. Human review and independent evidence verification are required.

## Developer

**Mounika Gollapalli**

GitHub: https://github.com/Mounikagollapalli

*CaseIQ — Turn documents into explainable checks, and keep decisions human-led.*
