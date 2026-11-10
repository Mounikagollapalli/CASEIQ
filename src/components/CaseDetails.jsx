import { useEffect, useState } from "react";
import { getCaseById, getApiError } from "../services/api";

function CaseDetails({ caseId, onBack, onAnalyze }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setItem(null); setError("");
    getCaseById(caseId).then(setItem).catch(err=>setError(getApiError(err,"Could not load this case.")));
  }, [caseId]);
  return <div>
    <button className="btn btn-secondary mb-4" onClick={onBack}>← Back to cases</button>
    {error && <div className="notice notice-error">{error}</div>}
    {!item && !error && <div className="panel empty-state">Loading case details…</div>}
    {item && <div className="panel">
      <div className="section-row"><div><p className="eyebrow">CASE #{item.id}</p><h2 className="panel-title text-lg">{item.title}</h2><p className="panel-subtitle">Created {item.created_at}</p></div><span className={"badge "+(item.risk_level ? "badge-"+item.risk_level : "badge-neutral")}>{item.risk_level || "Not analyzed"}</span></div>
      <div className="grid grid-cols-2 gap-3 my-5"><div className="metric-card"><p className="metric-label">Workflow status</p><p className="font-bold mt-2 capitalize">{item.status.replace("_"," ")}</p></div><div className="metric-card"><p className="metric-label">Risk score</p><p className="font-bold mt-2">{item.risk_score == null ? "Not available" : item.risk_score+"%"}</p></div></div>
      <h3 className="panel-title mb-2">Document summary</h3><p className="text-xs leading-6 text-slate-600">{item.summary || "No summary available."}</p>
      <button className="btn btn-primary mt-5" onClick={()=>onAnalyze(item.id)}>Run / view risk analysis</button>
    </div>}
  </div>;
}
export default CaseDetails;
