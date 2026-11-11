import { useEffect, useState } from "react";
import { getDashboardStats, getCases, getApiError } from "../services/api";

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true); setError("");
    try {
      const [summary, recent] = await Promise.all([getDashboardStats(), getCases()]);
      setStats(summary); setCases(recent.slice(0, 5));
    } catch (err) { setError(getApiError(err, "Unable to connect to the CaseIQ API.")); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  const metrics = [
    { label: "Total cases", value: stats?.total_cases ?? "—", icon: "▤", foot: "Cases registered" },
    { label: "High-gap cases", value: stats?.high_risk_cases ?? "—", icon: "!", foot: "Need careful verification" },
    { label: "QA agreement", value: stats?.qa_accuracy == null ? "—" : stats.qa_accuracy + "%", icon: "✓", foot: "Reviewer alignment with completeness flag" },
    { label: "Pending reviews", value: stats?.pending_reviews ?? "—", icon: "◷", foot: "Awaiting human decision" },
    { label: "Approved decisions", value: stats?.approved_reviews ?? 0, icon: "✓", foot: "Human-approved cases" },
    { label: "Rejected decisions", value: stats?.rejected_reviews ?? 0, icon: "×", foot: "Human-rejected cases" },
  ];

  return <div>
    {error && <div className="notice notice-error" role="alert">{error}<button className="btn btn-secondary ml-3" onClick={loadDashboard}>Retry</button></div>}
    <div className="metric-grid">{metrics.map(metric => <div className="metric-card" key={metric.label}><div className="metric-top"><span className="metric-label">{metric.label}</span><span className="metric-icon">{metric.icon}</span></div><p className="metric-value">{loading ? "…" : metric.value}</p><p className="metric-foot">{metric.foot}</p></div>)}</div>
    <div className="two-column">
      <div className="panel">
        <div className="section-row"><div><h2 className="panel-title">Recent cases</h2><p className="panel-subtitle">Latest documents received by the workspace</p></div><button className="btn btn-secondary" onClick={() => onNavigate("cases")}>View all</button></div>
        {cases.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Case</th><th>Status</th><th>Assessment</th></tr></thead><tbody>{cases.map(item => <tr key={item.id}><td><strong>#{item.id}</strong> · {item.title}</td><td className="capitalize">{item.status.replace("_", " ")}</td><td><span className={"badge " + (item.risk_level ? "badge-" + item.risk_level : "badge-neutral")}>{item.risk_level || "Not analyzed"}</span></td></tr>)}</tbody></table></div> : <div className="empty-state">{loading ? "Loading recent cases…" : "No cases yet. Upload a PDF to create your first case."}</div>}
      </div>
      <div className="panel">
        <h2 className="panel-title">Review workflow</h2><p className="panel-subtitle">A transparent, human-led process</p>
        <div className="mt-5 space-y-4">{[["01", "Receive document", "Upload and extract PDF text."], ["02", "Assess completeness", "Check fields relevant to the document type."], ["03", "Human decision", "Verify evidence and record a reviewer comment."]].map(step => <div className="flex gap-3" key={step[0]}><span className="metric-icon">{step[0]}</span><div><p className="text-xs font-bold text-slate-700">{step[1]}</p><p className="text-xs text-slate-400 mt-1">{step[2]}</p></div></div>)}</div>
        <button className="btn btn-primary w-full mt-6" onClick={() => onNavigate("documents")}>Upload a document</button>
      </div>
    </div>
  </div>;
}
export default Dashboard;
