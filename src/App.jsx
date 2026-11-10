import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CaseList from "./components/CaseList";
import CaseDetails from "./components/CaseDetails";
import DocumentUpload from "./components/DocumentUpload";
import RiskAnalysis from "./components/RiskAnalysis";
import HumanReview from "./components/HumanReview";
import PolicyKnowledge from "./components/PolicyKnowledge";
import Analytics from "./components/Analytics";

const pageTitles = {
  dashboard: "Overview",
  cases: "Case management",
  documents: "Document intelligence",
  risk: "AI risk analysis",
  policy: "Policy knowledge base",
  review: "Human review",
  analytics: "Analytics & reports",
};

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const workspaceLabel = import.meta.env.DEV ? "Local workspace" : "Cloud workspace";

  function changePage(page) {
    setCurrentPage(page);
    setSelectedCaseId(null);
  }

  function openAnalysis(caseId) {
    setSelectedCaseId(caseId);
    setCurrentPage("risk");
  }

  let content;
  if (currentPage === "dashboard") content = <Dashboard onNavigate={changePage} />;
  else if (currentPage === "cases") {
    content = selectedCaseId === null
      ? <CaseList onSelectCase={setSelectedCaseId} />
      : <CaseDetails caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} onAnalyze={openAnalysis} />;
  } else if (currentPage === "documents") content = <DocumentUpload onAnalyze={openAnalysis} />;
  else if (currentPage === "risk") content = <RiskAnalysis caseId={selectedCaseId} />;
  else if (currentPage === "policy") content = <PolicyKnowledge />;
  else if (currentPage === "review") content = <HumanReview />;
  else content = <Analytics />;

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <div className="workspace">
        <Sidebar currentPage={currentPage} onChangePage={changePage} />
        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CASEIQ WORKSPACE</p>
              <h1>{pageTitles[currentPage]}</h1>
              <p className="page-subtitle">Review documents, understand risk, and keep decisions human-led.</p>
            </div>
            <span className="workspace-status"><span /> {workspaceLabel}</span>
          </div>
          {content}
          <footer className="app-footer">CaseIQ · AI-assisted quality assurance · Human review required</footer>
        </main>
      </div>
    </div>
  );
}

export default App;
