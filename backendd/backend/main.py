# CaseIQ backend. Run with:  uvicorn main:app --reload --port 8000

import json
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from pypdf import PdfReader

from database import Base, engine, SessionLocal, Case, Review
import ml_service
import rag_service
import ai_service

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CaseIQ API")

# Allow the React app (port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ReviewInput(BaseModel):
    case_id: int
    decision: str
    comment: str = ""


class PolicyQuestion(BaseModel):
    question: str


def case_to_dict(case):
    return {
        "id": case.id,
        "title": case.title,
        "status": case.status,
        "summary": case.summary,
        "risk_score": case.risk_score,
        "risk_level": case.risk_level,
        "created_at": str(case.created_at),
    }


def calculate_qa_accuracy(db):
    """Share of reviewed cases where the AI risk agreed with the human.
    AI flagged a problem = risk score 40 or more. Human rejected = problem."""
    reviews = db.query(Review).all()
    if len(reviews) == 0:
        return None
    agree = 0
    for review in reviews:
        case = db.query(Case).filter(Case.id == review.case_id).first()
        if case is None or case.risk_score is None:
            continue
        ai_flagged = case.risk_score >= 40
        human_rejected = review.decision == "rejected"
        if ai_flagged == human_rejected:
            agree += 1
    return round(agree / len(reviews) * 100, 1)


@app.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return {
        "total_cases": db.query(Case).count(),
        "high_risk_cases": db.query(Case).filter(Case.risk_level == "high").count(),
        "qa_accuracy": calculate_qa_accuracy(db),
        "pending_reviews": db.query(Case).filter(Case.status == "in_review").count(),
    }


@app.get("/cases")
def list_cases(db: Session = Depends(get_db)):
    result = []
    for case in db.query(Case).order_by(Case.id.desc()).all():
        result.append(case_to_dict(case))
    return result


@app.get("/cases/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case_to_dict(case)


@app.post("/documents/upload")
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    reader = PdfReader(file.file)
    all_text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            all_text += page_text + "\n"

    if all_text.strip() == "":
        raise HTTPException(status_code=400, detail="No text found. Scanned PDFs need OCR.")

    case = Case(
        title=file.filename,
        status="open",
        document_text=all_text,
        summary=all_text[:300],
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    return {
        "filename": file.filename,
        "page_count": len(reader.pages),
        "extracted_text": all_text,
        "case_id": case.id,
    }


@app.post("/cases/{case_id}/analyze")
def analyze_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")

    score, level, method = ml_service.predict_risk(case.document_text)
    missing = ml_service.find_missing_fields(case.document_text)
    evidence = rag_service.search_policies(case.document_text[:1000])

    # Rule-based explanation (always available)
    reasons = []
    for field in missing:
        reasons.append("The word '" + field + "' was not found in the document.")
    if len(reasons) == 0:
        reasons.append("All required fields were found.")
    recommended_action = "Send to human review."

    ai_used = False
    ai_message = "OpenAI is not configured. Add OPENAI_API_KEY to backend/.env for AI analysis."

    if ai_service.is_ai_configured():
        try:
            ai_result = ai_service.get_ai_analysis(case.document_text, evidence, missing)
            reasons = ai_result.get("reasons", reasons)
            missing = ai_result.get("missing_information", missing)
            recommended_action = ai_result.get("recommended_action", recommended_action)
            ai_used = True
            ai_message = "Explanation written by OpenAI using the policy evidence shown."
        except Exception as error:
            ai_message = "OpenAI call failed: " + str(error)

    analysis = {
        "risk_score": score,
        "risk_level": level,
        "method": method,
        "reasons": reasons,
        "missing_information": missing,
        "recommended_action": recommended_action,
        "evidence": evidence,
        "ai_used": ai_used,
        "ai_message": ai_message,
    }

    case.risk_score = score
    case.risk_level = level
    case.ai_recommendation = recommended_action
    case.analysis_json = json.dumps(analysis)
    case.status = "in_review"
    db.commit()
    return analysis


@app.get("/reviews/pending")
def pending_reviews(db: Session = Depends(get_db)):
    result = []
    for case in db.query(Case).filter(Case.status == "in_review").all():
        analysis = json.loads(case.analysis_json)
        result.append({
            "case_id": case.id,
            "title": case.title,
            "ai_recommendation": case.ai_recommendation,
            "risk_score": case.risk_score,
            "explanation": " ".join(analysis["reasons"]),
        })
    return result


@app.post("/reviews")
def save_review(data: ReviewInput, db: Session = Depends(get_db)):
    if data.decision != "approved" and data.decision != "rejected":
        raise HTTPException(status_code=400, detail="Decision must be approved or rejected")
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")

    db.add(Review(case_id=data.case_id, decision=data.decision, comment=data.comment))
    case.status = "closed"
    db.commit()
    return {"message": "Review saved"}


@app.post("/policies/search")
def policy_search(data: PolicyQuestion):
    return rag_service.search_policies(data.question)


@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    risk_counts = {"high": 0, "medium": 0, "low": 0, "not_analyzed": 0}
    for case in db.query(Case).all():
        if case.risk_level is None:
            risk_counts["not_analyzed"] += 1
        else:
            risk_counts[case.risk_level] += 1

    review_counts = {"approved": 0, "rejected": 0}
    for review in db.query(Review).all():
        review_counts[review.decision] += 1

    return {
        "risk_counts": risk_counts,
        "review_counts": review_counts,
        "qa_accuracy": calculate_qa_accuracy(db),
    }


@app.post("/ml/train")
def train(db: Session = Depends(get_db)):
    success, message = ml_service.train_model(db)
    return {"success": success, "message": message}
