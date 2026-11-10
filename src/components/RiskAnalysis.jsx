import { useState } from "react";
import { analyzeCase } from "../services/api";
import { getRiskColor } from "../services/helpers";

// Runs the analysis for props.caseId and shows the result from the backend.
// Expected result: { risk_score, risk_level, reasons: [...], missing_information: [...] }
function RiskAnalysis(props) {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAnalyze() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await analyzeCase(props.caseId);
      setResult(data);
    } catch (error) {
      setErrorMessage("Analysis failed. The ML/AI backend is built in Stage 4 and 5.");
    }
    setIsLoading(false);
  }

  // Turn the lists into <li> items with for loops
  const reasonItems = [];
  const missingItems = [];
  if (result !== null) {
    for (let i = 0; i < result.reasons.length; i++) {
      reasonItems.push(<li key={i}>{result.reasons[i]}</li>);
    }
    for (let i = 0; i < result.missing_information.length; i++) {
      missingItems.push(<li key={i}>{result.missing_information[i]}</li>);
    }
  }

  // If no case was chosen yet, ask the user to pick one first
  if (props.caseId === null) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">AI Risk Analysis</h2>
        <p className="text-gray-500">
          Open a case from Case Management and click "Run AI Risk Analysis".
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">AI Risk Analysis - Case #{props.caseId}</h2>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleAnalyze}
        disabled={isLoading}
      >
        {isLoading ? "Analyzing..." : "Analyze Case"}
      </button>
      {errorMessage !== "" && <p className="text-red-600 mt-3">{errorMessage}</p>}

      {result !== null && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <p className="text-3xl font-bold mb-2">Risk score: {result.risk_score}</p>
          <span className={"px-2 py-1 rounded text-xs " + getRiskColor(result.risk_level)}>
            {result.risk_level}
          </span>
          <p className="font-bold mt-4 mb-1">Why it was flagged</p>
          <ul className="list-disc ml-6">{reasonItems}</ul>
          <p className="font-bold mt-4 mb-1">Missing information</p>
          <ul className="list-disc ml-6">{missingItems}</ul>
        </div>
      )}
    </div>
  );
}

export default RiskAnalysis;
