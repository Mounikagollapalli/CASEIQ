import { useEffect, useState } from "react";
import { getPendingReviews, submitReview, getApiError } from "../services/api";

function HumanReview() {
  const [items,setItems]=useState([]),[comments,setComments]=useState({}),[error,setError]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(null);
  async function load(){setError("");try{setItems(await getPendingReviews());}catch(e){setError(getApiError(e,"Could not load pending reviews."));}}
  useEffect(()=>{load();},[]);
  async function decide(id,decision){setBusy(id);setError("");setMessage("");try{await submitReview(id,decision,comments[id]||"");setMessage("Case #"+id+" marked "+decision+".");await load();}catch(e){setError(getApiError(e,"Could not save this review."));}finally{setBusy(null);}}
  return <div><div className="panel"><div className="section-row"><div><h2 className="panel-title">Pending human decisions</h2><p className="panel-subtitle">Review the evidence and record the final decision.</p></div><span className="badge badge-neutral">{items.length} pending</span></div>{error&&<div className="notice notice-error">{error}</div>}{message&&<div className="notice notice-success">{message}</div>}
  {items.map(r=><article className="border-t border-slate-100 py-5" key={r.case_id}><div className="section-row"><div><p className="eyebrow">CASE #{r.case_id}</p><h3 className="panel-title">{r.title}</h3></div><span className="badge badge-neutral">Score {r.risk_score}</span></div><p className="text-xs text-slate-600 mt-2"><strong>AI recommendation:</strong> {r.ai_recommendation}</p><p className="text-xs text-slate-500 leading-6 mt-2">{r.explanation}</p><textarea className="form-control mt-3" rows="3" placeholder="Add reviewer notes (optional)" value={comments[r.case_id]||""} onChange={e=>setComments(p=>({...p,[r.case_id]:e.target.value}))}/><div className="flex gap-2 mt-3"><button className="btn btn-success" disabled={busy===r.case_id} onClick={()=>decide(r.case_id,"approved")}>Approve</button><button className="btn btn-danger" disabled={busy===r.case_id} onClick={()=>decide(r.case_id,"rejected")}>Reject</button></div></article>)}
  {!items.length&&!error&&<div className="empty-state">No cases are waiting for review.</div>}</div></div>;
}
export default HumanReview;
