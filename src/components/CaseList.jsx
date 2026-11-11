import { useEffect, useMemo, useState } from "react";
import { getCases, getApiError } from "../services/api";

function CaseList({ onSelectCase }) {
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases().then(setCases).catch(err => setError(getApiError(err, "Unable to load cases."))).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => cases.filter(c =>
    (status === "all" || c.status === status) &&
    (c.title || "").toLowerCase().includes(query.toLowerCase())
  ), [cases, query, status]);

  return <div className="panel">
    <div className="section-row"><div><h2 className="panel-title">All cases</h2><p className="panel-subtitle">{cases.length} case record(s) in this workspace</p></div><span className="badge badge-neutral">{filtered.length} shown</span></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <input className="form-control" placeholder="Search document title…" value={query} onChange={e=>setQuery(e.target.value)} />
      <select className="form-control" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="in_review">In review</option><option value="closed">Closed</option></select>
    </div>
    {error && <div className="notice notice-error">{error}</div>}
    <div className="table-wrap"><table className="data-table"><thead><tr><th>Case ID</th><th>Document</th><th>Status</th><th>Risk level</th><th>Action</th></tr></thead><tbody>
      {filtered.map(c=><tr key={c.id}><td>#{c.id}</td><td className="font-semibold text-slate-700">{c.title}</td><td className="capitalize">{c.status.replace("_"," ")}</td><td><span className={"badge "+(c.risk_level ? "badge-"+c.risk_level : "badge-neutral")}>{c.risk_level || "Not analyzed"}</span></td><td><button className="btn btn-secondary" onClick={()=>onSelectCase(c.id)}>View case →</button></td></tr>)}
    </tbody></table></div>
    {!loading && filtered.length===0 && <div className="empty-state">No matching cases found.</div>}
    {loading && <div className="empty-state">Loading case records…</div>}
  </div>;
}
export default CaseList;
