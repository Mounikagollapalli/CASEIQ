import os
import re
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestClassifier
from database import Case, Review

BASE_DIR = Path(__file__).resolve().parent
# Vercel's function filesystem is read-only; /tmp is writable but temporary.
MODEL_FILE = Path(
    os.getenv(
        "CASEIQ_MODEL_PATH",
        "/tmp/caseiq_risk_model.pkl" if os.getenv("VERCEL") else str(BASE_DIR / "risk_model.pkl"),
    )
)
REQUIRED_WORDS = ["name", "date", "amount", "signature", "address"]
MIN_REVIEWS_TO_TRAIN = 10


def find_missing_fields(text):
    lower_text = (text or "").lower()
    return [
        word for word in REQUIRED_WORDS
        if not re.search(r"\\b" + re.escape(word) + r"\\b", lower_text)
    ]


def build_features(text):
    text = text or ""
    return [
        len(text.split()),
        len(re.findall(r"\\d+", text)),
        len(find_missing_fields(text)),
    ]


def score_to_level(score):
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def predict_risk(text):
    """Return a transparent 0–100 completeness score and method."""
    if MODEL_FILE.exists():
        model = joblib.load(MODEL_FILE)
        probabilities = model.predict_proba([build_features(text)])[0]
        classes = list(model.classes_)
        problem_index = classes.index(1) if 1 in classes else 0
        score = round(float(probabilities[problem_index]) * 100, 1)
        return score, score_to_level(score), "trained_ml_model"

    missing_count = len(find_missing_fields(text))
    score = round(missing_count / len(REQUIRED_WORDS) * 100, 1)
    return score, score_to_level(score), "rule_based_completeness"


def train_model(db):
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

    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    model.fit(features, labels)
    MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_FILE)
    message = "Model trained on " + str(len(labels)) + " reviewed cases."
    if os.getenv("VERCEL"):
        message += " This serverless model file is temporary and may reset after a cold start."
    return True, message
