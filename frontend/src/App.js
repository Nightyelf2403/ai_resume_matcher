import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState("");
  const [score, setScore] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", job);

    const res = await axios.post("https://your-backend-url.onrender.com/match/", formData);
    setScore(res.data.match_score.toFixed(2));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>AI Resume Matcher</h1>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={e => setResume(e.target.files[0])} />
        <textarea placeholder="Paste Job Description..." value={job} onChange={e => setJob(e.target.value)} rows="6" cols="50" />
        <button type="submit">Match</button>
      </form>
      {score && <h2>Match Score: {score * 100}%</h2>}
    </div>
  );
}

export default App;

