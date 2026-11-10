# Risk scoring.
# - Before enough human reviews exist, we use a simple RULE (missing fields).
# - After enough reviews, we train a real RandomForest model on them.
# The result always says which method was used.

import os
import re
import joblib
from sklearn.ensemble import RandomForestClassifier
from database import Case, Review

MODEL_FILE = "risk_model.pkl"
REQUIRED_WORDS = ["name", "date", "amount", "signature", "address"]
MIN_REVIEWS_TO_TRAIN = 10


def find_missing_fields(text):
    missing = []
    lower_text = text.lower()
    for word in REQUIRED_WORDS:
        if word not in lower_text:
            missing.append(word)
    return missing


def build_features(text):
    word_count = len(text.split())
    number_count = len(re.findall(r"\d+", text))
    missing_count = len(find_missing_fields(text))
    return [word_count, number_count, missing_count]


def score_to_level(score):
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def predict_risk(text):
    """Returns (risk_score 0-100, risk_level, method)."""
    if os.path.exists(MODEL_FILE):
        model = joblib.load(MODEL_FILE)
        probabilities = model.predict_proba([build_features(text)])[0]
        score = round(float(probabilities[1]) * 100, 1)
        return score, score_to_level(score), "ml_model"

    missing_count = len(find_missing_fields(text))
    score = round(missing_count / len(REQUIRED_WORDS) * 100, 1)
    return score, score_to_level(score), "rule_based"


def train_model(db):
    """Train on human reviews: rejected = 1 (problem), approved = 0."""
    features = []
    labels = []
    for review in db.query(Review).all():
        case = db.query(Case).filter(Case.id == review.case_id).first()
        if case is None:
            continue
        features.append(build_features(case.document_text))
        if review.decision == "rejected":
            labels.append(1)
        else:
            labels.append(0)

    if len(labels) < MIN_REVIEWS_TO_TRAIN:
        return False, "Need at least " + str(MIN_REVIEWS_TO_TRAIN) + " reviewed cases. You have " + str(len(labels)) + "."
    if len(set(labels)) < 2:
        return False, "Need both approved and rejected reviews to train."

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(features, labels)
    joblib.dump(model, MODEL_FILE)
    return True, "Model trained on " + str(len(labels)) + " reviewed cases."
