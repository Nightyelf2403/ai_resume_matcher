import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resume || !job) return alert("Please upload a resume and paste a job description");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", job);

    setLoading(true);
    try {
      const res = await axios.post("https://your-backend-url.onrender.com/match/", formData); // 🔁 Replace this with your actual Render backend URL
      setScore(res.data.match_score.toFixed(2));
    } catch (err) {
      alert("Error matching resume. Check backend URL.");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h1>🔍 AI Resume Matcher</h1>
      <p>Upload your resume and paste a job description to see how well they match.</p>
      <form onSubmit={handleUpload}>
        <label>Upload Resume (TXT or PDF):</label><br />
        <input type="file" onChange={e => setResume(e.target.files[0])} /><br /><br />

        <label>Paste Job Description:</label><br />
        <textarea value={job} onChange={e => setJob(e.target.value)} rows="8" cols="60" /><br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Matching..." : "Match Resume"}
        </button>
      </form>
      {score && (
        <h2 style={{ marginTop: "1rem", color: "green" }}>
          ✅ Match Score: {score * 100}%
        </h2>
      )}
    </div>
  );
}

export default App;
