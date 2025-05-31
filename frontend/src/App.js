import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resume || !job) return alert("Please upload a resume and enter a job description.");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", job);

    setLoading(true);
    try {
      const res = await axios.post("https://ai-resume-matcher-6brq.onrender.com/match/", formData);
      setScore(res.data.match_score.toFixed(2));
    } catch (err) {
      alert("Error: Could not match resume. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>🧠 AI Resume Matcher</h1>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setResume(e.target.files[0])}
        /><br /><br />
        <textarea
          placeholder="Paste job description here..."
          rows="6"
          value={job}
          onChange={(e) => setJob(e.target.value)}
        /><br /><br />
        <button type="submit">{loading ? "Matching..." : "Match Resume"}</button>
      </form>
      {score && <h3>📝 Match Score: {score}</h3>}
    </div>
  );
}

export default App;
