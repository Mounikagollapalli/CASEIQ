import { useState } from "react";
import { searchPolicies } from "../services/api";

// Search box for the policy documents stored in backend/policies
function PolicyKnowledge() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSearch() {
    setErrorMessage("");
    try {
      const data = await searchPolicies(question);
      setResults(data);
    } catch (error) {
      setErrorMessage("Search failed. Is the backend running on port 8000?");
    }
  }

  const resultCards = [];
  if (results !== null) {
    for (let i = 0; i < results.length; i++) {
      resultCards.push(
        <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
          <p className="text-sm text-gray-500">
            {results[i].source} (match score {results[i].score})
          </p>
          <p>{results[i].text}</p>
        </div>
      );
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Policy Knowledge Base</h2>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="border rounded px-3 py-2 w-96 bg-white"
          placeholder="Ask about a policy, e.g. missing signature"
          value={question}
          onChange={function (event) {
            setQuestion(event.target.value);
          }}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={handleSearch}>
          Search
        </button>
      </div>
      {errorMessage !== "" && <p className="text-red-600">{errorMessage}</p>}
      {resultCards}
      {results !== null && results.length === 0 && (
        <p className="text-gray-500">No matching policy text found.</p>
      )}
    </div>
  );
}

export default PolicyKnowledge;
