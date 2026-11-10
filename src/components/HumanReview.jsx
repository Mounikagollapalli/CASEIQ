import { useState, useEffect } from "react";
import { getPendingReviews, submitReview } from "../services/api";

// The human reviewer sees each AI recommendation and approves or rejects it.
function HumanReview() {
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState({}); // one comment per case id
  const [message, setMessage] = useState("");

  async function loadReviews() {
    try {
      const data = await getPendingReviews();
      setReviews(data);
    } catch (error) {
      setMessage("Could not load pending reviews. Is the backend running?");
    }
  }

  useEffect(function () {
    loadReviews();
  }, []);

  function handleCommentChange(caseId, text) {
    const newComments = { ...comments };
    newComments[caseId] = text;
    setComments(newComments);
  }

  async function handleDecision(caseId, decision) {
    let comment = comments[caseId];
    if (comment === undefined) {
      comment = "";
    }
    try {
      await submitReview(caseId, decision, comment);
      setMessage("Case #" + caseId + " was " + decision + ".");
      loadReviews(); // reload the list so the finished case disappears
    } catch (error) {
      setMessage("Could not save the review.");
    }
  }

  const cards = [];
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    cards.push(
      <div key={r.case_id} className="bg-white p-5 rounded-lg shadow mb-4">
        <h3 className="font-bold">
          Case #{r.case_id}: {r.title}
        </h3>
        <p className="text-sm mt-2">
          <strong>AI recommendation:</strong> {r.ai_recommendation}
        </p>
        <p className="text-sm mt-1">
          <strong>Risk score:</strong> {r.risk_score}
        </p>
        <p className="text-sm mt-1">
          <strong>Explanation:</strong> {r.explanation}
        </p>
        <textarea
          className="border rounded w-full p-2 mt-3 text-sm"
          placeholder="Reviewer comment (optional)"
          value={comments[r.case_id] === undefined ? "" : comments[r.case_id]}
          onChange={function (event) {
            handleCommentChange(r.case_id, event.target.value);
          }}
        />
        <div className="mt-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            onClick={function () {
              handleDecision(r.case_id, "approved");
            }}
          >
            Approve
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={function () {
              handleDecision(r.case_id, "rejected");
            }}
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Human Review</h2>
      {message !== "" && <p className="bg-blue-50 text-blue-700 p-3 rounded mb-4">{message}</p>}
      {cards}
      {reviews.length === 0 && <p className="text-gray-500">No pending reviews.</p>}
    </div>
  );
}

export default HumanReview;
