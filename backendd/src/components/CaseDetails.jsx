import { useState, useEffect } from "react";
import { getCaseById } from "../services/api";
import { getRiskColor } from "../services/helpers";

// Shows everything about ONE case. props.caseId says which case to load.
function CaseDetails(props) {
  const [caseData, setCaseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(
    function () {
      async function loadCase() {
        try {
          const data = await getCaseById(props.caseId);
          setCaseData(data);
        } catch (error) {
          setErrorMessage("Could not load this case.");
        }
      }
      loadCase();
    },
    [props.caseId]
  );

  return (
    <div>
      <button className="text-indigo-600 mb-4" onClick={props.onBack}>
        &larr; Back to cases
      </button>
      {errorMessage !== "" && (
        <p className="bg-red-50 text-red-700 p-3 rounded">{errorMessage}</p>
      )}
      {caseData === null && errorMessage === "" && <p>Loading...</p>}
      {caseData !== null && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2">{caseData.title}</h2>
          <p className="text-gray-500 mb-4">
            Case #{caseData.id} | Status: {caseData.status}
          </p>
          <span className={"px-2 py-1 rounded text-xs " + getRiskColor(caseData.risk_level)}>
            {caseData.risk_level ? caseData.risk_level : "not analyzed"}
          </span>
          <p className="mt-4">{caseData.summary}</p>
          <button
            className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={function () {
              props.onAnalyze(caseData.id);
            }}
          >
            Run AI Risk Analysis
          </button>
        </div>
      )}
    </div>
  );
}

export default CaseDetails;
