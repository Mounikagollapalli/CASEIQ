import { useEffect, useState } from "react";
import { getAnalytics, getApiError } from "../services/api";

function BarGroup({title,data}) {
  const entries=Object.entries(data||{}),max=Math.max(1,...entries.map(([,v])=>v));
  return <div className="panel"><h3 className="panel-title">{title}</h3>{entries.map(([label,value])=><div className="mt-5" key={label}><div className="section-row mb-2"><span className="text-xs capitalize text-slate-600">{label.replace("_"," ")}</span><strong className="text-xs text-slate-700">{value}</strong></div><div className="progress-track"><div className="progress-fill" style={{width:(value/max*100)+"%"}}/></div></div>)}{!entries.length&&<p className="empty-state">No analytics data available.</p>}</div>;
}
function Analytics() {
  const [data,setData]=useState(null),[error,setError]=useState("");
  useEffect(()=>{getAnalytics().then(setData).catch(e=>setError(getApiError(e,"Unable to load analytics.")));},[]);
  if(error)return <div className="notice notice-error">{error}</div>;
  if(!data)return <div className="panel empty-state">Loading analytics…</div>;
  return <div><div className="metric-grid"><div className="metric-card"><p className="metric-label">QA agreement</p><p className="metric-value">{data.qa_accuracy==null?"—":data.qa_accuracy+"%"}</p><p className="metric-foot">Based on available human reviews</p></div><div className="metric-card"><p className="metric-label">Approved</p><p className="metric-value">{data.review_counts?.approved??0}</p></div><div className="metric-card"><p className="metric-label">Rejected</p><p className="metric-value">{data.review_counts?.rejected??0}</p></div></div><div className="two-column"><BarGroup title="Risk distribution" data={data.risk_counts}/><BarGroup title="Human review outcomes" data={data.review_counts}/></div><p className="panel-subtitle">Metrics are calculated from the cases and reviews currently stored in the connected database.</p></div>;
}
export default Analytics;
