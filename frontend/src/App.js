import React, { useState } from "react";
import axios from "axios";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!resumeFile || resumeFile.size > 5 * 1024 * 1024) {
      setError("Please upload a resume under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", resumeFile);
    formData.append("job_description", jobDesc);

    try {
      const response = await axios.post(
        "https://ai-resume-matcher.onrender.com/match/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container">
      <h1 className="header">AI Resume Matcher</h1>
      <form onSubmit={handleSubmit} className="form-section">
        <label className="label">Upload Resume (PDF, &lt; 5MB)</label>
        <input
          className="input"
          type="file"
          accept=".pdf"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />

        <label className="label">Paste Job Description</label>
        <textarea
          className="input"
          rows="5"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        ></textarea>

        <button className="button" type="submit">
          Match Resume
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      {result && (
        <div className="result-box">
          <h2 className="font-semibold text-lg">Match: {result.match_percentage}%</h2>
          <p className="mt-2 mb-1 font-medium">Matching Keywords:</p>
          <div>
            {result.matching_keywords.map((word, index) => (
              <span key={index} className="keyword-match">{word}</span>
            ))}
          </div>
          <p className="mt-4 mb-1 font-medium">Explanation:</p>
          <ul className="list-disc list-inside text-sm">
            {result.explanation.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
