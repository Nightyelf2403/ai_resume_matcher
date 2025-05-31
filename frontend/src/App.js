import React, { useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";

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
      setLoading(true);
      const response = await axios.post("/api/match/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    const message = `Rating: ${rating || "No emoji"}\nFeedback: ${feedbackText}`;
    try {
      await axios.post("https://formspree.io/f/moqgjgvy", { message });
      await axios.post("/api/feedback", {
        rating,
        feedback: feedbackText,
      });
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
      setFeedbackText("");
      setRating(null);
    } catch (err) {
      alert("Failed to send feedback. Please try again later.");
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 p-4 md:p-8 font-sans ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
      <div className="max-w-2xl mx-auto shadow-2xl rounded-2xl p-6 bg-opacity-90 backdrop-blur-md border border-indigo-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">AI Resume Matcher 🔍📄</h1>
          <button
            className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            Toggle Theme
          </button>
        </div>

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
              className={`w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              onClick={() => document.getElementById("resume-upload").click()}
            >
              <p className="text-sm text-center">{resumeFile ? resumeFile.name : "Drag and drop your PDF here or click to select"}</p>
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
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            {loading ? "Matching..." : "Match Resume"}
          </button>

          {error && <p className="text-red-600 mt-2 font-medium">{error}</p>}
        </form>

        {loading && (
          <div className="mt-4 text-center animate-pulse text-indigo-500 font-medium">
            Analyzing Resume...
          </div>
        )}

        {result && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-indigo-200">
            <h2 className="text-lg font-semibold text-indigo-700 mb-2">Match Score</h2>
            <div className="w-24 h-24 mx-auto">
              <CircularProgressbar
                value={result.match_percentage}
                text={`${result.match_percentage}%`}
                styles={buildStyles({
                  textColor: "#4f46e5",
                  pathColor: "#4f46e5",
                  trailColor: "#d1d5db",
                  textSize: "16px",
                })}
              />
            </div>

            <div className="mt-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                High Confidence
              </span>
              <p className="text-sm mt-2">
                Matched <strong>{result.matching_keywords.length}</strong> out of <strong>{result.total_keywords}</strong> relevant keywords.
              </p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Matching Keywords:</p>
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
            </div>

            <div className="mt-4">
              <p className="font-medium">How This Match Was Calculated:</p>
              <ul className="list-disc list-inside text-sm mt-2">
                <li>Semantic similarity between resume and job description.</li>
                <li>Keyword relevance and role match analysis.</li>
                <li>AI embeddings using Sentence Transformers.</li>
                <li>Score computed based on overlap and importance of keywords.</li>
              </ul>
            </div>

            {result.suggestions && (
              <div className="mt-4">
                <p className="font-medium text-red-600">AI Suggestions to Improve Match:</p>
                <ul className="list-disc list-inside text-sm mt-1 text-red-500">
                  {result.suggestions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">💬 Share Your Feedback</h2>
          <div className="flex space-x-4 text-2xl mb-3">
            {["😡", "😐", "🙂", "😃", "😍"].map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setRating(emoji)}
                className={`transform hover:scale-125 transition duration-200 rounded-full px-2 py-1 border-2 ${rating === emoji ? "border-indigo-600 bg-indigo-100" : "border-transparent"}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            rows="3"
            placeholder="Let us know how we can improve or what you loved!"
            className="block w-full border border-gray-300 p-2 rounded-lg mb-2"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit Feedback
          </button>

          {showThankYou && (
            <div className="mt-4 text-green-600 font-medium animate-bounce">
              🎉 Thanks for your feedback!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
