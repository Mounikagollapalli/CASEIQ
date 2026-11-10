import re

from database import Case, Review

MIN_REVIEWS_TO_TRAIN = 10

# These checks are document-specific completeness signals, not fraud predictions.
DOCUMENT_RULES = {
    "resume": {
        "fields": {
            "Name": lambda text: has_name(text),
            "Email address": lambda text: bool(re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)),
            "Phone number": lambda text: len(re.sub(r"\D", "", text)) >= 10,
            "Education": lambda text: bool(re.search(r"education|b\.?tech|bachelor|university|college|degree|master", text, re.I)),
            "Technical skills": lambda text: bool(re.search(r"technical skills|skills|programming|python|javascript|sql", text, re.I)),
            "Work experience": lambda text: bool(re.search(r"work experience|professional experience|employment|experience", text, re.I)),
            "Projects": lambda text: bool(re.search(r"projects|project experience", text, re.I)),
        },
        "description": "Résumé",
    },
    "invoice": {
        "fields": {
            "Invoice number": lambda text: bool(re.search(r"invoice\s*(number|no\.?|#)", text, re.I)),
            "Invoice date": lambda text: bool(re.search(r"invoice date|date\s*:", text, re.I)),
            "Supplier details": lambda text: bool(re.search(r"supplier|seller|from\s*:", text, re.I)),
            "Customer details": lambda text: bool(re.search(r"bill to|billed to|customer|buyer", text, re.I)),
            "Total amount": lambda text: bool(re.search(r"total|amount due|grand total", text, re.I)),
        },
        "description": "Invoice",
    },
    "agreement": {
        "fields": {
            "Parties": lambda text: bool(re.search(r"between|parties|party name", text, re.I)),
            "Effective date": lambda text: bool(re.search(r"effective date|dated|date of this agreement", text, re.I)),
            "Terms": lambda text: bool(re.search(r"terms|conditions|obligations", text, re.I)),
            "Signature section": lambda text: bool(re.search(r"signature|signed by|\bsign\b", text, re.I)),
        },
        "description": "Agreement",
    },
}

def has_name(text):
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    ignored = {"professional", "summary", "technical", "skills", "curriculum", "vitae", "resume", "profile", "contact"}
    for line in lines[:8]:
        words = re.findall(r"[A-Za-z][A-Za-z'-]+", line)
        if 2 <= len(words) <= 4 and all(word[0].isupper() for word in words):
            if not any(word.lower() in ignored for word in words):
                return True
    uppercase_tokens = re.findall(r"\b[A-Z][A-Z'-]{1,}\b", (text or "")[:600])
    return len(uppercase_tokens) >= 2

def classify_document(text):
    content = text or ""
    if re.search(r"professional summary|technical skills|work experience|curriculum vitae|\bresume\b", content, re.I):
        return "resume"
    resume_signals = sum(bool(re.search(pattern, content, re.I)) for pattern in (
        r"education", r"experience", r"technical skills", r"projects", r"linkedin", r"career objective"
    ))
    if resume_signals >= 2:
        return "resume"
    if re.search(r"invoice|amount due|bill to|tax invoice", content, re.I):
        return "invoice"
    if re.search(r"agreement|terms and conditions|hereby agree|memorandum of understanding", content, re.I):
        return "agreement"
    return "general"

def find_missing_fields(text, document_type=None):
    content = text or ""
    kind = document_type or classify_document(content)
    rules = DOCUMENT_RULES.get(kind)
    if not rules:
        return []
    return [label for label, check in rules["fields"].items() if not check(content)]

def build_features(text):
    content = text or ""
    kind = classify_document(content)
    missing = find_missing_fields(content, kind)
    return [
        len(content.split()),
        len(re.findall(r"\d+", content)),
        len(missing),
        {"general": 0, "resume": 1, "invoice": 2, "agreement": 3}.get(kind, 0),
    ]

def score_to_level(score):
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"

def predict_risk(text):
    """Return a document-specific completeness gap indicator, not a fraud score."""
    kind = classify_document(text)
    rules = DOCUMENT_RULES.get(kind)
    if not rules:
        return None, "unclassified", "document_type_unclassified"
    missing_count = len(find_missing_fields(text, kind))
    total_fields = len(rules["fields"])
    score = round(missing_count / total_fields * 100, 1) if total_fields else 0
    return score, score_to_level(score), "document_type_completeness"

def train_model(db):
    """Experimental model training; trained output is not used for production scoring."""
    features, labels = [], []
    for review in db.query(Review).all():
        case = db.query(Case).filter(Case.id == review.case_id).first()
        if case is None:
            continue
        features.append(build_features(case.document_text))
        labels.append(1 if review.decision == "rejected" else 0)

    if len(labels) < MIN_REVIEWS_TO_TRAIN:
        return False, "At least " + str(MIN_REVIEWS_TO_TRAIN) + " reviewed cases are required. Current: " + str(len(labels)) + "."
    if len(set(labels)) < 2:
        return False, "Both approved and rejected examples are required."
    return False, "Training is currently disabled until a representative, validated review dataset is available."
