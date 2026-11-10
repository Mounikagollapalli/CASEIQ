import { useEffect, useState } from "react";
import { getPendingReviews, submitReview, getApiError } from "../services/api";

function HumanReview() {
  const [items, setItems] = useState([]);
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(null);

  async function load() {
    setError("");
    try { setItems(await getPendingReviews()); }
    catch (e) { setError(getApiError(e, "Could not load pending reviews.")); }
  }

  useEffect(() => { load(); }, []);

  async function decide(id, decision) {
    const comment = (comments[id] || "").trim();
    if (comment.length < 3) {
      setError("Add a reviewer comment of at least 3 characters before recording a decision.");
      return;
    }
    setBusy(id); setError(""); setMessage("");
    try {
      await submitReview(id, decision, comment);
      setMessage("Case #" + id + " marked " + decision + ". The review was saved.");
      await load();
    } catch (e) { setError(getApiError(e, "Could not save this review.")); }
    finally { setBusy(null); }
  }

  return (
    <div className="panel">
      <div className="section-row">
        <div><h2 className="panel-title">Pending human decisions</h2><p className="panel-subtitle">Review document-specific checks and record your final decision.</p></div>
        <span className="badge badge-neutral">{items.length} pending</span>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {message && <div className="notice notice-success" role="status">{message}</div>}
      {items.map((item) => (
        <article className="review-card" key={item.case_id}>
          <div className="section-row">
            <div><p className="eyebrow">CASE #{item.case_id} · {item.document_type}</p><h3 className="panel-title">{item.title}</h3></div>
            <span className={"badge " + (item.risk_level === "high" ? "badge-high" : item.risk_level === "medium" ? "badge-medium" : item.risk_level === "low" ? "badge-low" : "badge-neutral")}>
              {item.risk_score == null ? "Unclassified" : "Completeness gaps " + item.risk_score + "%"}
            </span>
          </div>
          <p className="review-recommendation"><strong>System guidance:</strong> {item.ai_recommendation}</p>
          <p className="review-explanation">{item.explanation}</p>
          {item.missing_information?.length > 0 && <p className="review-missing"><strong>Fields to verify:</strong> {item.missing_information.join(", ")}</p>}
          <label className="review-label" htmlFor={"review-comment-" + item.case_id}>Reviewer comment <span>Required</span></label>
          <textarea id={"review-comment-" + item.case_id} className="form-control" rows="3" minLength="3" maxLength="1000" placeholder="Explain the evidence supporting your decision…" value={comments[item.case_id] || ""} onChange={e => setComments(previous => ({ ...previous, [item.case_id]: e.target.value }))} />
          <div className="review-actions">
            <button className="btn btn-success" disabled={busy === item.case_id || (comments[item.case_id] || "").trim().length < 3} onClick={() => decide(item.case_id, "approved")}>{busy === item.case_id ? "Saving…" : "Approve"}</button>
            <button className="btn btn-danger" disabled={busy === item.case_id || (comments[item.case_id] || "").trim().length < 3} onClick={() => decide(item.case_id, "rejected")}>{busy === item.case_id ? "Saving…" : "Reject"}</button>
          </div>
        </article>
      ))}
      {!items.length && !error && <div className="empty-state">No cases are waiting for review.</div>}
    </div>
  );
}
export default HumanReview;
