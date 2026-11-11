import { useEffect, useState } from "react";
import { analyzeCase, getCaseById, getApiError } from "../services/api";

function RiskAnalysis({ caseId }) {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    let active = true;
    setResult(null); setError(""); setTitle("");
    if (caseId) getCaseById(caseId).then(item => { if (active) setTitle(item.title); }).catch(err => { if (active) setError(getApiError(err, "Could not load this case.")); });
    return () => { active = false; };
  }, [caseId]);

  async function run() {
    setBusy(true); setError("");
    try { setResult(await analyzeCase(caseId)); }
    catch (err) { setError(getApiError(err, "Analysis could not be completed.")); }
    finally { setBusy(false); }
  }

  if (!caseId) return <div className="panel empty-state">Choose a case from Case Management to run its risk analysis.</div>;

  return (
    <div>
      <div className="panel">
        <div className="section-row">
          <div><p className="eyebrow">CASE #{caseId}</p><h2 className="panel-title">{title || "Selected case"}</h2><p className="panel-subtitle">Document-specific completeness checks with human verification.</p></div>
          <button className="btn btn-primary" onClick={run} disabled={busy}>{busy ? "Analyzing…" : "Run analysis"}</button>
        </div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
      </div>
      {result && <>
        <div className="panel analysis-context">
          <p className="eyebrow">DOCUMENT CLASSIFICATION</p>
          <h2 className="panel-title">{result.document_type_label || "Unclassified document"}</h2>
          <p className="panel-subtitle">{result.method === "document_type_unclassified" ? "The document type was not recognized. No generic completeness score has been assigned." : "Checks are selected for this document category. Fields not relevant to this category are not treated as missing."}</p>
        </div>
        <div className="metric-grid">
          <div className="metric-card"><p className="metric-label">Completeness gaps</p><p className="metric-value">{result.risk_score == null ? "—" : result.risk_score + "%"}</p>{result.risk_score != null && <div className="progress-track"><div className="progress-fill" style={{ width: Math.min(100, Math.max(0, result.risk_score)) + "%" }} /></div>}<p className="metric-foot">Share of configured required checks not detected</p></div>
          <div className="metric-card"><p className="metric-label">Assessment level</p><p className="metric-value capitalize">{result.risk_level === "unclassified" ? "Unclassified" : result.risk_level}</p><span className="badge badge-neutral">{result.method?.replaceAll("_", " ")}</span></div>
          <div className="metric-card"><p className="metric-label">AI explanation</p><p className="metric-value text-xl">{result.ai_used ? "Enabled" : "Rule-based"}</p><p className="metric-foot">{result.ai_message}</p></div>
          <div className="metric-card"><p className="metric-label">Policy matches</p><p className="metric-value">{result.evidence?.length || 0}</p><p className="metric-foot">Retrieved policy passages</p></div>
        </div>
        <div className="notice notice-info">{result.score_note}</div>
        <div className="two-column">
          <div className="panel"><h3 className="panel-title">Assessment findings</h3><ul className="list-clean">{(result.reasons || []).map((reason, index) => <li key={index}>{reason}</li>)}</ul></div>
          <div className="panel"><h3 className="panel-title">Fields to verify</h3>{result.missing_information?.length ? <ul className="list-clean">{result.missing_information.map((field, index) => <li key={index}>{field}</li>)}</ul> : <p className="panel-subtitle mt-3">No missing fields were identified by the configured checks.</p>}</div>
        </div>
        <div className="panel">
          <h3 className="panel-title">Recommended next step</h3><p className="text-xs text-slate-600 mt-3">{result.recommended_action}</p>
          <h3 className="panel-title mt-5">Policy evidence</h3>
          {result.evidence?.length ? result.evidence.map((item, index) => <div className="border-t border-slate-100 py-3 mt-2" key={index}><p className="text-xs font-bold text-slate-600">{item.source} · relevance {item.score}</p><p className="text-xs leading-6 text-slate-500 mt-1">{item.text}</p></div>) : <p className="panel-subtitle mt-3">No matching policy passages were found.</p>}
        </div>
      </>}
    </div>
  );
}
export default RiskAnalysis;
