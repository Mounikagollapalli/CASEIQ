import { useEffect, useState } from "react";
import { getAnalytics, getReviewHistory, getApiError } from "../services/api";

function BarGroup({ title, data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, value]) => value));
  return (
    <div className="panel">
      <h3 className="panel-title">{title}</h3>
      {entries.map(([label, value]) => (
        <div className="mt-5" key={label}>
          <div className="section-row mb-2">
            <span className="text-xs capitalize text-slate-600">{label.replace("_", " ")}</span>
            <strong className="text-xs text-slate-700">{value}</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: (value / max * 100) + "%" }} />
          </div>
        </div>
      ))}
      {!entries.length && <p className="empty-state">No analytics data available.</p>}
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAnalytics(), getReviewHistory()])
      .then(([analyticsData, reviewData]) => {
        setData(analyticsData);
        setHistory(reviewData);
      })
      .catch(error => setError(getApiError(error, "Unable to load analytics and review history.")));
  }, []);

  if (error) return <div className="notice notice-error">{error}</div>;
  if (!data) return <div className="panel empty-state">Loading analytics…</div>;

  return (
    <div>
      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-label">QA agreement</p>
          <p className="metric-value">{data.qa_accuracy == null ? "—" : data.qa_accuracy + "%"}</p>
          <p className="metric-foot">Based on available human reviews</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Approved</p>
          <p className="metric-value">{data.review_counts?.approved ?? 0}</p>
          <p className="metric-foot">Human-approved cases</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Rejected</p>
          <p className="metric-value">{data.review_counts?.rejected ?? 0}</p>
          <p className="metric-foot">Human-rejected cases</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total decisions</p>
          <p className="metric-value">{(data.review_counts?.approved ?? 0) + (data.review_counts?.rejected ?? 0)}</p>
          <p className="metric-foot">Recorded reviewer outcomes</p>
        </div>
      </div>

      <div className="two-column">
        <BarGroup title="Document completeness distribution" data={data.risk_counts} />
        <BarGroup title="Human review outcomes" data={data.review_counts} />
      </div>

      <div className="panel mt-5">
        <div className="section-row">
          <div>
            <h3 className="panel-title">Recent human review decisions</h3>
            <p className="panel-subtitle">Saved decisions with their comments and timestamps.</p>
          </div>
          <span className="badge badge-neutral">{history.length} records</span>
        </div>
        {history.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Case</th><th>Decision</th><th>Reviewer comment</th><th>Recorded at</th></tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.review_id}>
                    <td><strong>#{item.case_id}</strong><br /><span className="text-slate-500">{item.case_title}</span></td>
                    <td><span className={"badge " + (item.decision === "approved" ? "badge-low" : "badge-high")}>{item.decision}</span></td>
                    <td>{item.comment}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No human decisions have been recorded yet.</div>}
      </div>
      <p className="panel-subtitle mt-4">Metrics are calculated from cases and reviews stored in the connected database. Historical decisions are retained after a case leaves the pending queue.</p>
    </div>
  );
}

export default Analytics;
