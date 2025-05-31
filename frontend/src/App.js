import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile || !jobDescription) {
      setError('Please provide both resume and job description.');
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setError('Resume file size should be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post(
        'https://your-backend-url.onrender.com/match/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setMatchScore(response.data.match_percentage);
      setBreakdown(response.data.matching_keywords);
    } catch (err) {
      setError('Error analyzing resume. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">AI Resume Matcher</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste Job Description..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Match Resume
          </button>
        </form>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {matchScore !== null && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-center text-green-600">Match: {matchScore}%</h2>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Keyword Matches:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {breakdown.map((word, idx) => (
                  <li key={idx}>{word}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
