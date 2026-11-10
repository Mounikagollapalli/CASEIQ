import { useEffect, useState } from "react";
import { analyzeCase, getCaseById, getApiError } from "../services/api";

function RiskAnalysis({ caseId }) {
  const [result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[title,setTitle]=useState("");
  useEffect(()=>{setResult(null);setError("");if(caseId)getCaseById(caseId).then(c=>setTitle(c.title)).catch(()=>{});},[caseId]);
  async function run(){setBusy(true);setError("");try{setResult(await analyzeCase(caseId));}catch(e){setError(getApiError(e,"Analysis could not be completed."));}finally{setBusy(false);}}
  if(!caseId)return <div className="panel empty-state">Choose a case from Case Management to run its risk analysis.</div>;
  return <div>
    <div className="panel"><div className="section-row"><div><p className="eyebrow">CASE #{caseId}</p><h2 className="panel-title">{title || "Selected case"}</h2><p className="panel-subtitle">Risk scoring is advisory and must be checked by a human reviewer.</p></div><button className="btn btn-primary" onClick={run} disabled={busy}>{busy?"Analyzing…":"Run analysis"}</button></div>{error&&<div className="notice notice-error">{error}</div>}</div>
    {result&&<><div className="metric-grid"><div className="metric-card"><p className="metric-label">Risk score</p><p className="metric-value">{result.risk_score}%</p><div className="progress-track"><div className="progress-fill" style={{width:Math.min(100,Math.max(0,result.risk_score))+"%"}}/></div></div><div className="metric-card"><p className="metric-label">Risk category</p><p className="metric-value capitalize">{result.risk_level}</p><span className="badge badge-neutral">{result.method?.replace("_"," ")}</span></div><div className="metric-card"><p className="metric-label">AI explanation</p><p className="metric-value text-xl">{result.ai_used?"Enabled":"Rule-based"}</p><p className="metric-foot">{result.ai_message}</p></div><div className="metric-card"><p className="metric-label">Policy matches</p><p className="metric-value">{result.evidence?.length || 0}</p><p className="metric-foot">Retrieved policy passages</p></div></div>
      <div className="two-column"><div className="panel"><h3 className="panel-title">Assessment reasons</h3><ul className="list-clean">{(result.reasons||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div><div className="panel"><h3 className="panel-title">Missing information</h3>{result.missing_information?.length?<ul className="list-clean">{result.missing_information.map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="panel-subtitle mt-3">No missing fields were identified by the configured checks.</p>}</div></div>
      <div className="panel"><h3 className="panel-title">Recommended next step</h3><p className="text-xs text-slate-600 mt-3">{result.recommended_action}</p><h3 className="panel-title mt-5">Policy evidence</h3>{result.evidence?.length?result.evidence.map((x,i)=><div className="border-t border-slate-100 py-3 mt-2" key={i}><p className="text-xs font-bold text-slate-600">{x.source} · relevance {x.score}</p><p className="text-xs leading-6 text-slate-500 mt-1">{x.text}</p></div>):<p className="panel-subtitle mt-3">No matching policy passages were found.</p>}</div>
    </>}
  </div>;
}
export default RiskAnalysis;
