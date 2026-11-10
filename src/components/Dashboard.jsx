
import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        setErrorMessage(
          "Could not load dashboard data. Is the backend running on port 8000?"
        );
      }
    }

    loadStats();
  }, []);

  let totalCases = "-";
  let highRisk = "-";
  let accuracy = "-";
  let pending = "-";

  if (stats !== null) {
    totalCases = stats.total_cases ?? 0;
    highRisk = stats.high_risk_cases ?? 0;

    accuracy =
      stats.qa_accuracy === null || stats.qa_accuracy === undefined
        ? "Not rated"
        : stats.qa_accuracy + "%";

    pending = stats.pending_reviews ?? 0;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {errorMessage !== "" && (
        <p className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Cases</p>
          <p className="text-3xl font-bold">{totalCases}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">High Risk Cases</p>
          <p className="text-3xl font-bold text-red-600">{highRisk}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">QA Accuracy</p>
          <p className="text-2xl font-bold text-green-600">{accuracy}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pending Reviews</p>
          <p className="text-3xl font-bold text-yellow-600">{pending}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
