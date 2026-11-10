import json
import os
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from pypdf import PdfReader

from database import Base, engine, SessionLocal, Case, Review
import ml_service
import rag_service
import ai_service

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CaseIQ API",
    description="Document intelligence and human-led quality assurance API.",
    version="1.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    comment: str = Field(min_length=3, max_length=1000)

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
    """Agreement between the completeness-based review flag and human outcome."""
    reviews = db.query(Review).all()
    valid = 0
    agree = 0
    for review in reviews:
        case = db.query(Case).filter(Case.id == review.case_id).first()
        if case is None or case.risk_score is None or case.risk_level == "unclassified":
            continue
        valid += 1
        ai_flagged = case.risk_score >= 40
        human_rejected = review.decision == "rejected"
        if ai_flagged == human_rejected:
            agree += 1
    return round(agree / valid * 100, 1) if valid else None

@app.get("/health")
def health():
    return {"ok": True, "service": "caseiq-api", "version": "1.1.0"}

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
    return [case_to_dict(case) for case in db.query(Case).order_by(Case.id.desc()).all()]

@app.get("/cases/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case_to_dict(case)

@app.post("/documents/upload")
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF must be 10 MB or smaller")
    try:
        reader = PdfReader(file.file)
        if reader.is_encrypted:
            raise HTTPException(status_code=400, detail="This PDF is password-protected. Upload an unlocked PDF.")
        all_text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                all_text += page_text + "\n"
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="The PDF could not be read. Please upload a valid PDF file.")
    if not all_text.strip():
        raise HTTPException(status_code=400, detail="No selectable text was found. Scanned PDFs need OCR before upload.")
    case = Case(title=filename[:255], status="open", document_text=all_text, summary=all_text[:500])
    db.add(case)
    db.commit()
    db.refresh(case)
    return {"filename": filename, "page_count": len(reader.pages), "extracted_text": all_text, "case_id": case.id}

@app.post("/cases/{case_id}/analyze")
def analyze_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    document_text = case.document_text or ""
    document_type = ml_service.classify_document(document_text)
    score, level, method = ml_service.predict_risk(document_text)
    missing = ml_service.find_missing_fields(document_text, document_type)
    evidence = rag_service.search_policies(document_text[:1500])
    if document_type == "general":
        reasons = ["The document type could not be confidently identified. Select the correct document category and review it manually."]
        recommended_action = "Manual classification and human review required."
    else:
        reasons = [
            "Required " + document_type + " field not detected: " + field + "."
            for field in missing
        ]
        if not reasons:
            reasons.append("All configured " + document_type + " completeness checks passed.")
        recommended_action = "Human review required; verify the extracted content and supporting evidence."
    ai_used = False
    ai_message = "Optional AI explanation is not configured. Document-specific checks remain available."
    if ai_service.is_ai_configured() and document_type != "general":
        try:
            ai_result = ai_service.get_ai_analysis(document_text, evidence, missing)
            reasons = ai_result.get("reasons", reasons)
            recommended_action = ai_result.get("recommended_action", recommended_action)
            ai_used = True
            ai_message = "AI-assisted explanation generated from the supplied policy excerpts. Verify all findings."
        except Exception:
            ai_message = "The optional AI explanation was unavailable. Deterministic findings are shown."
    analysis = {
        "document_type": document_type,
        "document_type_label": ml_service.DOCUMENT_RULES.get(document_type, {}).get("description", "Unclassified document"),
        "risk_score": score,
        "risk_level": level,
        "method": method,
        "reasons": reasons,
        "missing_information": missing,
        "recommended_action": recommended_action,
        "evidence": evidence,
        "ai_used": ai_used,
        "ai_message": ai_message,
        "score_note": "This is a document completeness indicator, not a prediction of fraud, trustworthiness, or personal risk.",
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
    for case in db.query(Case).filter(Case.status == "in_review").order_by(Case.id.desc()).all():
        analysis = json.loads(case.analysis_json or "{}")
        result.append({
            "case_id": case.id,
            "title": case.title,
            "ai_recommendation": case.ai_recommendation or "Human review required.",
            "risk_score": case.risk_score,
            "risk_level": case.risk_level,
            "document_type": analysis.get("document_type_label", "Unclassified document"),
            "missing_information": analysis.get("missing_information", []),
            "explanation": " ".join(analysis.get("reasons", [])),
        })
    return result

@app.post("/reviews")
def save_review(data: ReviewInput, db: Session = Depends(get_db)):
    if data.decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Decision must be approved or rejected")
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.status != "in_review":
        raise HTTPException(status_code=409, detail="This case is not waiting for review")
    db.add(Review(case_id=data.case_id, decision=data.decision, comment=data.comment.strip()))
    case.status = "closed"
    db.commit()
    return {"message": "Review saved", "case_id": case.id, "decision": data.decision}

@app.post("/policies/search")
def policy_search(data: PolicyQuestion):
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Enter a policy question")
    return rag_service.search_policies(data.question.strip())

@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    risk_counts = {"high": 0, "medium": 0, "low": 0, "not_analyzed": 0}
    for case in db.query(Case).all():
        if case.risk_level not in ("high", "medium", "low"):
            risk_counts["not_analyzed"] += 1
        else:
            risk_counts[case.risk_level] += 1
    review_counts = {"approved": 0, "rejected": 0}
    for review in db.query(Review).all():
        if review.decision in review_counts:
            review_counts[review.decision] += 1
    return {"risk_counts": risk_counts, "review_counts": review_counts, "qa_accuracy": calculate_qa_accuracy(db)}

@app.post("/ml/train")
def train(db: Session = Depends(get_db)):
    success, message = ml_service.train_model(db)
    return {"success": success, "message": message}
