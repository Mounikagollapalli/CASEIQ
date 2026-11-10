import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CaseList from "./components/CaseList";
import CaseDetails from "./components/CaseDetails";
import DocumentUpload from "./components/DocumentUpload";
import RiskAnalysis from "./components/RiskAnalysis";
import HumanReview from "./components/HumanReview";

// App decides which page to show, based on currentPage.
function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  function handleChangePage(pageId) {
    setCurrentPage(pageId);
    setSelectedCaseId(null);
  }

  function handleAnalyze(caseId) {
    setSelectedCaseId(caseId);
    setCurrentPage("risk");
  }

  let pageContent = null;

  if (currentPage === "dashboard") {
    pageContent = <Dashboard />;
  } else if (currentPage === "cases") {
    if (selectedCaseId === null) {
      pageContent = <CaseList onSelectCase={setSelectedCaseId} />;
    } else {
      pageContent = (
        <CaseDetails
          caseId={selectedCaseId}
          onBack={function () {
            setSelectedCaseId(null);
          }}
          onAnalyze={handleAnalyze}
        />
      );
    }
  } else if (currentPage === "documents") {
    pageContent = <DocumentUpload />;
  } else if (currentPage === "risk") {
    pageContent = <RiskAnalysis caseId={selectedCaseId} />;
  } else if (currentPage === "review") {
    pageContent = <HumanReview />;
  } else if (currentPage === "policy") {
    pageContent = <p className="text-gray-500">Policy Knowledge Base - built in Stage 5 (RAG).</p>;
  } else if (currentPage === "analytics") {
    pageContent = <p className="text-gray-500">Analytics & Reports - built in Stage 7.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar currentPage={currentPage} onChangePage={handleChangePage} />
        <div className="flex-1 p-6">{pageContent}</div>
      </div>
    </div>
  );
}

export default App;
