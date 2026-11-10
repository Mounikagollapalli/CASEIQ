import { useRef, useState } from "react";
import { uploadDocument, analyzeCase, getApiError } from "../services/api";

function DocumentUpload({ onAnalyze }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function chooseFile(nextFile) {
    setError(""); setNotice(""); setResult(null); setAnalysis(null);
    if (!nextFile) { setFile(null); return; }
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(null); setError("Please choose a PDF document."); return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null); setError("The PDF is larger than 10 MB. Please choose a smaller file."); return;
    }
    setFile(nextFile);
  }

  async function handleUpload() {
    if (!file) { setError("Choose a PDF file before uploading."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await uploadDocument(file);
      setResult(data);
      setNotice("Document text extracted and case created successfully.");
    } catch (err) {
      setError(getApiError(err, "Upload failed. Check that the FastAPI server is running."));
    } finally { setBusy(false); }
  }

  async function handleAnalyze() {
    if (!result?.case_id) return;
    setBusy(true); setError("");
    try {
      const data = await analyzeCase(result.case_id);
      setAnalysis(data);
      setNotice("Analysis completed. Review the findings before making a decision.");
    } catch (err) { setError(getApiError(err, "Risk analysis failed.")); }
    finally { setBusy(false); }
  }

  return <section>
    <div className="panel">
      <div className="section-row"><div><h2 className="panel-title">Upload a case document</h2><p className="panel-subtitle">PDF only · Maximum 10 MB · Text-based PDFs</p></div><span className="badge badge-neutral">Document intake</span></div>
      <div className="upload-zone">
        <div className="upload-symbol">⇧</div>
        <p className="panel-title">Select a PDF to begin</p>
        <p className="panel-subtitle">Choose a document from your device. Scanned PDFs currently require OCR and are not supported.</p>
        <input ref={inputRef} className="hidden" type="file" accept="application/pdf,.pdf" onChange={(e) => chooseFile(e.target.files?.[0])} />
        <button className="btn btn-secondary mt-4" type="button" onClick={() => inputRef.current?.click()}>Browse files</button>
        {file && <p className="file-name">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      {notice && <div className="notice notice-success">{notice}</div>}
      <div className="section-row mt-4"><span className="panel-subtitle">Your document is processed by the connected CaseIQ API.</span><button className="btn btn-primary" onClick={handleUpload} disabled={!file || busy}>{busy ? "Processing..." : "Upload & extract"}</button></div>
    </div>
    {result && <div className="panel">
      <div className="section-row"><div><h2 className="panel-title">Extraction result</h2><p className="panel-subtitle">{result.filename} · {result.page_count} page(s) · Case #{result.case_id}</p></div><span className="badge badge-low">Extracted</span></div>
      <pre className="text-xs leading-6 text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-4 whitespace-pre-wrap max-h-72 overflow-auto">{result.extracted_text}</pre>
      <div className="section-row mt-4"><span className="panel-subtitle">Next: run the initial risk and policy checks.</span><button className="btn btn-primary" onClick={handleAnalyze} disabled={busy}>{busy ? "Analyzing..." : "Run risk analysis"}</button></div>
    </div>}
    {analysis && <div className="panel">
      <h2 className="panel-title mb-3">Analysis summary</h2>
      <div className="metric-grid">
        <div className="metric-card"><p className="metric-label">Risk score</p><p className="metric-value">{analysis.risk_score}%</p></div>
        <div className="metric-card"><p className="metric-label">Risk level</p><p className="metric-value capitalize">{analysis.risk_level}</p></div>
      </div>
      <p className="panel-subtitle">Method: {analysis.method} · AI explanation: {analysis.ai_used ? "Used" : "Not used"}</p>
      <button className="btn btn-secondary mt-4" onClick={() => onAnalyze?.(result.case_id)}>Open full analysis</button>
    </div>}
  </section>;
}
export default DocumentUpload;
