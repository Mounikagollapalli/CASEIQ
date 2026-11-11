import { useState } from "react";
import { searchPolicies, getApiError } from "../services/api";

function PolicyKnowledge() {
  const [question,setQuestion]=useState("What information should be present in a complete case document?");
  const [results,setResults]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function search(e){e.preventDefault();if(!question.trim())return;setBusy(true);setError("");try{setResults(await searchPolicies(question));}catch(err){setError(getApiError(err,"Policy search failed."));}finally{setBusy(false);}}
  return <div className="panel"><h2 className="panel-title">Search policy guidance</h2><p className="panel-subtitle">Find relevant passages from the policy documents configured in the backend.</p><form onSubmit={search} className="mt-5"><label className="text-xs font-semibold text-slate-600 block mb-2">Your question</label><textarea className="form-control" rows="3" value={question} onChange={e=>setQuestion(e.target.value)}/><button className="btn btn-primary mt-3" disabled={busy}>{busy?"Searching…":"Search policies"}</button></form>{error&&<div className="notice notice-error">{error}</div>}{results.map((r,i)=><article className="border-t border-slate-100 mt-5 pt-4" key={i}><div className="section-row"><strong className="text-xs text-slate-700">{r.source}</strong><span className="badge badge-neutral">Match {r.score}</span></div><p className="text-xs leading-6 text-slate-600">{r.text}</p></article>)}{results.length===0&&!busy&&!error&&<div className="empty-state">Submit a question to retrieve relevant policy passages.</div>}</div>;
}
export default PolicyKnowledge;
