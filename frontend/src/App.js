// === FRONTEND (React) - App.js ===
import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [score, setScore] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Resume file must be less than 5MB.");
    } else {
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDesc);

    try {
      const res = await axios.post("https://YOUR-BACKEND-URL/match/", formData);
      setScore(res.data.match_score);
      setKeywords(res.data.matched_keywords);
      setSentences(res.data.matched_sentences);
    } catch (err) {
      alert("Failed to match resume");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">🧠 AI Resume Matcher</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="block w-full border p-2"
          />
          <textarea
            placeholder="Paste job description here..."
            rows="6"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="block w-full border p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Match Resume
          </button>
        </form>

        {score !== null && (
          <div className="mt-6 bg-green-100 p-4 rounded">
            <h3 className="text-xl font-semibold">✅ Match Score: {(score * 100).toFixed(2)}%</h3>
            <p className="mt-2">🔍 <strong>Matched Keywords:</strong> {keywords.join(", ")}</p>
            <div className="mt-2">
              <strong>🧾 Matched Sentences:</strong>
              <ul className="list-disc pl-6">
                {sentences.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
