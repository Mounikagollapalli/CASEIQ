
import { useState } from "react";
import { uploadDocument, analyzeCase } from "../services/api";

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFileChange(event) {
    const file = event.target.files[0];

    setSelectedFile(file || null);
    setResult(null);
    setAnalysis(null);
    setErrorMessage("");

    if (file && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setErrorMessage("Please select a PDF file.");
      event.target.value = "";
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Please choose a PDF file first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const data = await uploadDocument(selectedFile);
      setResult(data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || "Upload failed. Check whether the backend is running."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const data = await analyzeCase(result.case_id);
      setAnalysis(data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || "Risk analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Document Intelligence</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Upload & Extract</h3>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];

            console.log("Selected file:", file);

            setSelectedFile(file || null);
            setResult(null);
            setAnalysis(null);
            setErrorMessage("");
          }}
        />

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          {isUploading ? "Uploading..." : "Upload & Extract"}
        </button>

        {errorMessage !== "" && (
          <p className="text-red-600 mt-3">{errorMessage}</p>
        )}
      </div>

      {result !== null && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="mb-2"><strong>File:</strong> {result.filename}</p>
          <p className="mb-2"><strong>Pages:</strong> {result.page_count}</p>
          <p className="mb-2"><strong>Case ID:</strong> {result.case_id}</p>

          <h3 className="font-bold mb-2">Extracted Text</h3>

          <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
            {result.extracted_text}
          </pre>

          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Run AI Risk Analysis"}
          </button>
        </div>
      )}

      {analysis !== null && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Risk Analysis Results</h3>
          <pre className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
