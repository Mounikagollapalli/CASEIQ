import { useState, useEffect } from "react";
import { getCases } from "../services/api";
import { getRiskColor } from "../services/helpers";

// Table of cases with a search box and a status filter.
function CaseList(props) {
  const [cases, setCases] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadCases() {
      try {
        const data = await getCases();
        setCases(data);
      } catch (error) {
        setErrorMessage("Could not load cases. Is the backend running on port 8000?");
      }
    }
    loadCases();
  }, []);

  // Keep only the cases that match the search text and the status filter
  const visibleCases = [];
  for (let i = 0; i < cases.length; i++) {
    const oneCase = cases[i];
    const searchLower = searchText.toLowerCase();
    const titleLower = oneCase.title.toLowerCase();

    let matchesSearch = true;
    if (searchText !== "" && titleLower.indexOf(searchLower) === -1) {
      matchesSearch = false;
    }

    let matchesStatus = true;
    if (statusFilter !== "all" && oneCase.status !== statusFilter) {
      matchesStatus = false;
    }

    if (matchesSearch && matchesStatus) {
      visibleCases.push(oneCase);
    }
  }

  // Build the table rows
  const rows = [];
  for (let i = 0; i < visibleCases.length; i++) {
    const c = visibleCases[i];
    rows.push(
      <tr key={c.id} className="border-t">
        <td className="p-3">{c.id}</td>
        <td className="p-3">{c.title}</td>
        <td className="p-3">{c.status}</td>
        <td className="p-3">
          <span className={"px-2 py-1 rounded text-xs " + getRiskColor(c.risk_level)}>
            {c.risk_level ? c.risk_level : "not analyzed"}
          </span>
        </td>
        <td className="p-3">
          <button
            className="text-indigo-600 hover:underline"
            onClick={function () {
              props.onSelectCase(c.id);
            }}
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Case Management</h2>
      {errorMessage !== "" && (
        <p className="bg-red-50 text-red-700 p-3 rounded mb-4">{errorMessage}</p>
      )}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          className="border rounded px-3 py-2 w-72 bg-white"
          value={searchText}
          onChange={function (event) {
            setSearchText(event.target.value);
          }}
        />
        <select
          className="border rounded px-3 py-2 bg-white"
          value={statusFilter}
          onChange={function (event) {
            setStatusFilter(event.target.value);
          }}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <table className="w-full bg-white rounded-lg shadow text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Risk</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      {visibleCases.length === 0 && errorMessage === "" && (
        <p className="text-gray-500 mt-4">No cases found.</p>
      )}
    </div>
  );
}

export default CaseList;
