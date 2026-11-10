// This file keeps ALL backend calls in one place.
// Every function uses Axios and returns the response data.
// The FastAPI backend (built in a later stage) must provide these URLs.

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Dashboard numbers: { total_cases, high_risk_cases, qa_accuracy, pending_reviews }
export async function getDashboardStats() {
  const response = await api.get("/dashboard/stats");
  return response.data;
}

// List of all cases
export async function getCases() {
  const response = await api.get("/cases");
  return response.data;
}

// One case by id
export async function getCaseById(caseId) {
  const response = await api.get("/cases/" + caseId);
  return response.data;
}

// Upload a PDF file. FormData is the standard way to send files.
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/documents/upload", formData);
  return response.data;
}

// Ask the backend (ML model + AI) to analyze one case
export async function analyzeCase(caseId) {
  const response = await api.post("/cases/" + caseId + "/analyze");
  return response.data;
}

// Cases waiting for a human reviewer
export async function getPendingReviews() {
  const response = await api.get("/reviews/pending");
  return response.data;
}

// Save the reviewer's decision: "approved" or "rejected"
export async function submitReview(caseId, decision, comment) {
  const response = await api.post("/reviews", {
    case_id: caseId,
    decision: decision,
    comment: comment,
  });
  return response.data;
}
