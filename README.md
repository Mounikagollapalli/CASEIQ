# CaseIQ — AI-Powered Decision Intelligence & Quality Assurance Platform

**Explainable AI. Intelligent Document Analysis. Human-Led Decisions.**

CaseIQ is an AI-powered, document-driven decision intelligence platform designed to streamline case evaluation, strengthen quality assurance, and improve the consistency of review workflows.

The platform brings together intelligent document processing, explainable risk assessment, policy-based information retrieval, and AI-assisted insights within a unified case management environment. It transforms unstructured PDF documents into structured, reviewable case information and provides transparent analytical support to human decision-makers.

Built with React, FastAPI, Python, and Machine Learning technologies, CaseIQ demonstrates the practical integration of modern full-stack engineering with applied AI, information retrieval, and responsible decision-support architecture.

## Overview

CaseIQ addresses a fundamental challenge in document-intensive operations: reviewing large amounts of information while maintaining accuracy, consistency, traceability, and accountability.

Rather than treating AI as an independent decision-maker, CaseIQ uses a structured intelligence pipeline that combines deterministic analysis with optional generative AI assistance.

Every assessment is designed to be explainable, policy-informed, and subject to human verification.

## Core Capabilities

**Intelligent Document Processing**

PDF ingestion and text extraction using PyPDF, transforming document content into structured case records for further analysis.

**Explainable Risk Assessment**

A transparent, rule-based risk evaluation engine that identifies missing information, highlights potential review concerns, and generates understandable risk indicators.

**Policy Intelligence & Retrieval**

TF-IDF-based document retrieval powered by Scikit-learn, enabling relevant policy passages to be identified from the internal policy knowledge base and presented alongside case information.

**AI-Assisted Case Explanations**

Optional OpenAI integration for generating contextual explanations of analytical findings. The core workflow remains functional without an external AI API key.

**Centralized Case Management**

A unified workspace for searching cases, monitoring statuses, examining extracted information, and managing the complete review lifecycle.

**Human-in-the-Loop Review**

Reviewer-controlled approval and rejection workflows with comments, ensuring that recommendations remain advisory and final decisions remain with authorized human reviewers.

**Analytics & Quality Monitoring**

Dashboard insights covering case volumes, risk distributions, review outcomes, and operational performance indicators.

## System Architecture

CaseIQ follows a modular full-stack architecture that separates the presentation layer, application services, analytical components, and persistence layer.

- **Frontend:** React and Vite provide a responsive interface for case management, document intelligence, analytical insights, and review operations.
- **Backend:** FastAPI exposes RESTful endpoints and coordinates document processing, risk evaluation, policy retrieval, and review workflows.
- **Data Layer:** SQLAlchemy manages application data models and database interactions, with SQLite supporting local development.
- **Intelligence Layer:** Python and Scikit-learn power rule-based assessment and TF-IDF-based policy retrieval.
- **Document Processing:** PyPDF extracts text from supported PDF documents.
- **Generative AI:** OpenAI API integration provides optional natural-language explanations.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | Python, FastAPI |
| Database | SQLAlchemy, SQLite |
| Machine Learning | Scikit-learn |
| Information Retrieval | TF-IDF, Natural Language Processing |
| Document Intelligence | PyPDF, PDF Text Extraction |
| Generative AI | OpenAI API (Optional) |
| Development Tools | Git, GitHub, VS Code |

## Engineering Approach

The project emphasizes several important software engineering principles:

- Modular separation of frontend, backend, and analytical services.
- REST API-based communication between application layers.
- Explainable and deterministic baseline risk assessment.
- Retrieval-based policy grounding instead of relying exclusively on generated responses.
- Optional integration with external AI services.
- Structured data persistence and case lifecycle management.
- Human oversight and accountability in decision workflows.

## Responsible AI & Design Principles

CaseIQ is developed as a decision-support prototype rather than an autonomous decision-making system.

Its risk indicators are based on transparent completeness heuristics and are not presented as statistically validated predictions. Policy retrieval provides relevant reference material, not authoritative legal interpretations. AI-generated explanations are advisory and require independent verification.

The platform is designed around explainability, transparency, and human accountability.

## Project Structure

The repository maintains a clear separation between the active frontend application and backend services.

- `src/` — Active React frontend application.
- `backendd/backend/` — FastAPI backend, application logic, document processing, and AI services.
- `public/` — Static frontend assets.
- `package.json` — Frontend dependencies and development scripts.

The legacy `backendd/src/` directory is not part of the active root Vite frontend build.

## Current Scope & Future Direction

The current implementation establishes the core document-to-case workflow, explainable risk analysis, policy retrieval, optional AI explanations, and human review capabilities.

Potential future enhancements include:

- OCR support for scanned and image-based documents.
- Embedding-based semantic policy retrieval.
- Advanced risk analytics and configurable assessment rules.
- Persistent PostgreSQL storage for hosted deployments.
- Role-based access control and reviewer permissions.
- Audit trails and enhanced case traceability.
- Scalable document storage and processing infrastructure.

## Deployment Architecture

The frontend is connected to a GitHub repository and deployed through Vercel.

The backend is designed to run as a separately hosted FastAPI service. A production-oriented deployment requires a persistent database, HTTPS API configuration, and appropriate cross-origin resource sharing settings.

The current SQLite implementation is intended for local development and demonstration.

## Developer

**Mounika Gollapalli**

Software Developer | AI & Machine Learning Enthusiast

GitHub: https://github.com/Mounikagollapalli

---

*CaseIQ — Turning documents into explainable insights, and insights into informed human decisions.*
