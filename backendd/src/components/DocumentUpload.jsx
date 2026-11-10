import { useState } from "react";
import { uploadDocument } from "../services/api";

// Lets the user pick a PDF, sends it to the backend,
// and shows what the backend extracted.
function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
    setResult(null);
    setErrorMessage("");
  }

  async function handleUpload() {
    if (selectedFile === null) {
      setErrorMessage("Please choose a PDF file first.");
      return;
    }
    setIsUploading(true);
    setErrorMessage("");
    try {
      const data = await uploadDocument(selectedFile);
      setResult(data);
    } catch (error) {
      setErrorMessage("Upload failed. Is the backend running on port 8000?");
    }
    setIsUploading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Document Intelligence</h2>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button
          className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload & Extract"}
        </button>
        {errorMessage !== "" && <p className="text-red-600 mt-3">{errorMessage}</p>}
      </div>

      {result !== null && (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-2">
            <strong>File:</strong> {result.filename}
          </p>
          <p className="mb-2">
            <strong>Pages:</strong> {result.page_count}
          </p>
          <p className="mb-2 text-green-700">
            <strong>Case created:</strong> #{result.case_id} (see Case Management)
          </p>
          <p className="font-bold mb-1">Extracted text</p>
          <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
            {result.extracted_text}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
