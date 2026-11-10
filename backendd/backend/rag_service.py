# Policy retrieval (RAG - the "R" part).
# Policies are .txt files in the policies/ folder. Each paragraph is one chunk.
# We rank chunks with TF-IDF similarity (keyword based, no embeddings).

import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

POLICY_FOLDER = "policies"


def load_policy_chunks():
    chunks = []
    if not os.path.exists(POLICY_FOLDER):
        return chunks
    for filename in os.listdir(POLICY_FOLDER):
        if not filename.endswith(".txt"):
            continue
        file = open(os.path.join(POLICY_FOLDER, filename), encoding="utf-8")
        content = file.read()
        file.close()
        paragraphs = content.split("\n\n")
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if len(paragraph) > 20:
                chunks.append({"source": filename, "text": paragraph})
    return chunks


def search_policies(question, top_k=3):
    chunks = load_policy_chunks()
    if len(chunks) == 0 or question.strip() == "":
        return []

    texts = []
    for chunk in chunks:
        texts.append(chunk["text"])
    texts.append(question)  # the question goes last

    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        matrix = vectorizer.fit_transform(texts)
    except ValueError:
        return []

    similarities = cosine_similarity(matrix[len(texts) - 1], matrix[: len(texts) - 1])[0]

    scored = []
    for i in range(len(chunks)):
        scored.append((float(similarities[i]), i))
    scored.sort(reverse=True)

    results = []
    for score, index in scored[:top_k]:
        if score > 0:
            results.append({
                "source": chunks[index]["source"],
                "text": chunks[index]["text"],
                "score": round(score, 3),
            })
    return results
