import { useState, useEffect } from "react";
import { getAnalytics, trainModel } from "../services/api";

// Simple bar charts made with plain divs (no chart library needed).
function Analytics() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (error) {
      setMessage("Could not load analytics. Is the backend running on port 8000?");
    }
  }

  useEffect(function () {
    loadData();
  }, []);

  async function handleTrain() {
    try {
      const result = await trainModel();
      setMessage(result.message);
    } catch (error) {
      setMessage("Training request failed.");
    }
  }

  const bars = [];
  if (data !== null) {
    const names = ["high", "medium", "low", "not_analyzed"];
    let total = 0;
    for (let i = 0; i < names.length; i++) {
      total = total + data.risk_counts[names[i]];
    }
    for (let i = 0; i < names.length; i++) {
      const count = data.risk_counts[names[i]];
      let percent = 0;
      if (total > 0) {
        percent = (count / total) * 100;
      }
      bars.push(
        <div key={names[i]} className="mb-3">
          <p className="text-sm">
            {names[i]}: {count}
          </p>
          <div className="bg-gray-200 rounded h-4">
            <div className="bg-indigo-600 h-4 rounded" style={{ width: percent + "%" }}></div>
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics & Reports</h2>
      {message !== "" && <p className="bg-blue-50 text-blue-700 p-3 rounded mb-4">{message}</p>}
      {data !== null && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="font-bold mb-3">Cases by risk level</p>
          {bars}
          <p className="mt-4">
            Reviews: {data.review_counts.approved} approved, {data.review_counts.rejected} rejected
          </p>
          <p>
            AI vs human agreement: {data.qa_accuracy === null ? "no reviews yet" : data.qa_accuracy + "%"}
          </p>
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded" onClick={handleTrain}>
            Train ML model from reviews
          </button>
        </div>
      )}
    </div>
  );
}

export default Analytics;
