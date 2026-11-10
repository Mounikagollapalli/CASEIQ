import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

export async function getDashboardStats() {
  const { data } = await api.get("/dashboard/stats");
  return data;
}
export async function getCases() {
  const { data } = await api.get("/cases");
  return data;
}
export async function getCaseById(caseId) {
  const { data } = await api.get("/cases/" + caseId);
  return data;
}
export async function uploadDocument(file) {
  const body = new FormData();
  body.append("file", file);
  const { data } = await api.post("/documents/upload", body);
  return data;
}
export async function analyzeCase(caseId) {
  const { data } = await api.post("/cases/" + caseId + "/analyze");
  return data;
}
export async function getPendingReviews() {
  const { data } = await api.get("/reviews/pending");
  return data;
}
export async function submitReview(caseId, decision, comment) {
  const { data } = await api.post("/reviews", { case_id: caseId, decision, comment });
  return data;
}
export async function searchPolicies(question) {
  const { data } = await api.post("/policies/search", { question });
  return data;
}
export async function getAnalytics() {
  const { data } = await api.get("/analytics");
  return data;
}
export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.detail || error.message || fallback;
}
