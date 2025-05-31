import React, { useState } from "react";
import axios from "axios";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-600">
          AI Resume Matcher 🔍📄
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Upload Resume (PDF, &lt; 5MB)</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
              }`}
            >
              <p className="text-sm text-gray-600 text-center">
                {resumeFile ? resumeFile.name : "Drag and drop your PDF here or click to select"}
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="hidden"
                id="resume-upload"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Paste Job Description</label>
            <textarea
              rows="5"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="block w-full border border-gray-300 p-2 rounded-lg"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Match Resume
          </button>

          {error && <p className="text-red-600 mt-2 font-medium">{error}</p>}
        </form>

        {result && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-indigo-200">
            <h2 className="text-lg font-semibold text-indigo-700">
              Match Score: <span className="text-black">{result.match_percentage}%</span>
            </h2>
            <p className="mt-2 font-medium">Matching Keywords:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.matching_keywords.map((word, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="mt-4 font-medium">Explanation:</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {result.explanation.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
