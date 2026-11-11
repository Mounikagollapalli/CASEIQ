from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

POLICY_FOLDER = Path(__file__).resolve().parent / "policies"


def load_policy_chunks(document_type=None):
    chunks = []
    if not POLICY_FOLDER.exists():
        return chunks

    allowed_names = {
        "resume": {"resume_policy.txt", "general_policy.txt"},
        "cover_letter": {"cover_letter_policy.txt", "general_policy.txt"},
        "invoice": {"invoice_policy.txt", "general_policy.txt"},
        "agreement": {"agreement_policy.txt", "general_policy.txt"},
    }
    allowed = allowed_names.get(document_type)
    for path in sorted(POLICY_FOLDER.glob("*.txt")):
        if allowed is not None and path.name not in allowed:
            continue
        content = path.read_text(encoding="utf-8")
        for paragraph in content.split("\n\n"):
            paragraph = paragraph.strip()
            if len(paragraph) > 20:
                chunks.append({"source": path.name, "text": paragraph})
    return chunks


def search_policies(question, top_k=3, document_type=None, min_score=0.05):
    question = (question or "").strip()
    chunks = load_policy_chunks(document_type)
    if not chunks or not question:
        return []

    texts = [chunk["text"] for chunk in chunks] + [question]
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts)
    except ValueError:
        return []

    similarities = cosine_similarity(matrix[-1], matrix[:-1])[0]
    ranked = sorted(
        [(float(score), index) for index, score in enumerate(similarities)],
        reverse=True,
    )
    return [
        {
            "source": chunks[index]["source"],
            "text": chunks[index]["text"],
            "score": round(score, 3),
        }
        for score, index in ranked[:top_k]
        if score >= min_score
    ]
