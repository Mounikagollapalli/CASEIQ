import { useEffect, useState } from "react";
import { getDashboardStats, getCases, getApiError } from "../services/api";

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getCases()])
      .then(([summary, recent]) => { setStats(summary); setCases(recent.slice(0, 5)); })
      .catch((err) => setError(getApiError(err, "Unable to connect to the CaseIQ API.")))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    { label: "Total cases", value: stats?.total_cases ?? "—", icon: "▤", foot: "Cases registered" },
    { label: "High-risk cases", value: stats?.high_risk_cases ?? "—", icon: "!", foot: "Require careful review" },
    { label: "QA agreement", value: stats?.qa_accuracy == null ? "—" : stats.qa_accuracy + "%", icon: "✓", foot: "AI and reviewer alignment" },
    { label: "Pending reviews", value: stats?.pending_reviews ?? "—", icon: "◷", foot: "Awaiting human decision" },
  ];

  return <div>
    {error && <div className="notice notice-error">{error} <span className="block mt-1">Start FastAPI on port 8000 to load live case data.</span></div>}
    <div className="metric-grid">{metrics.map((m) => <div className="metric-card" key={m.label}><div className="metric-top"><span className="metric-label">{m.label}</span><span className="metric-icon">{m.icon}</span></div><p className="metric-value">{loading ? "…" : m.value}</p><p className="metric-foot">{m.foot}</p></div>)}</div>
    <div className="two-column">
      <div className="panel">
        <div className="section-row"><div><h2 className="panel-title">Recent cases</h2><p className="panel-subtitle">Latest documents received by the workspace</p></div><button className="btn btn-secondary" onClick={() => onNavigate("cases")}>View all</button></div>
        {cases.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Case</th><th>Status</th><th>Risk</th></tr></thead><tbody>{cases.map(c => <tr key={c.id}><td><strong>#{c.id}</strong> · {c.title}</td><td className="capitalize">{c.status.replace("_"," ")}</td><td><span className={"badge "+(c.risk_level ? "badge-"+c.risk_level : "badge-neutral")}>{c.risk_level || "Not analyzed"}</span></td></tr>)}</tbody></table></div> : <div className="empty-state">{loading ? "Loading recent cases…" : "No cases yet. Upload a PDF to create your first case."}</div>}
      </div>
      <div className="panel">
        <h2 className="panel-title">Review workflow</h2><p className="panel-subtitle">A transparent, human-led process</p>
        <div className="mt-5 space-y-4">{[["01","Receive document","Upload and extract PDF text."],["02","Assess risk","Review missing fields and policy evidence."],["03","Human decision","Approve or reject with a reviewer comment."]].map(x=><div className="flex gap-3" key={x[0]}><span className="metric-icon">{x[0]}</span><div><p className="text-xs font-bold text-slate-700">{x[1]}</p><p className="text-xs text-slate-400 mt-1">{x[2]}</p></div></div>)}</div>
        <button className="btn btn-primary w-full mt-6" onClick={() => onNavigate("documents")}>Upload a document</button>
      </div>
    </div>
  </div>;
}
export default Dashboard;
