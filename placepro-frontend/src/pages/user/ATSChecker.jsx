import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ATSChecker = () => {
  const { backendUrl } = useContext(AppContext);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription) {
      toast.error("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await axios.post(`${backendUrl}/api/user/check-resume`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Resume analyzed successfully!");
        setResult(response.data.data);
        console.log("Response:", response.data);
      } else {
        toast.error(response.data.message || "Failed to analyze resume");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-4 bg-gradient-to-b from-indigo-50 to-gray-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-indigo-900 tracking-tight">
            ATS Resume Analyzer
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Optimize your resume for Applicant Tracking Systems
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-indigo-500">
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">
              <span className="font-bold">Note:</span> Please upload your resume here. This tool won’t use the resume you previously submitted when you uploaded your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-indigo-900 font-semibold mb-2">
                Upload Your Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
              />
            </div>

            <div>
              <label className="block text-indigo-900 font-semibold mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting here..."
                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all h-40 resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Tip:</span> Copy the entire job description...
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold text-lg rounded-full transition-colors duration-300 shadow-md hover:shadow-lg ${
                loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>

          {result && (
            <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 border-t-4 border-indigo-600">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-indigo-900">Analysis Results</h2>
                <div className="mt-4 flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        strokeDasharray={`${result.atsScore}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-indigo-900">{result.atsScore}%</span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-lg text-gray-600">Your ATS Score</p>
              </div>

              <div className="space-y-6">
                {result.feedback.map((section, index) => {
                  const [title, ...content] = section.split("\n");
                  return (
                    <div key={index} className="bg-indigo-50 rounded-lg p-5 shadow-sm">
                      <h3 className="text-xl font-semibold text-indigo-900 mb-3">{title.replace(/\*\*/g, "")}</h3>
                      <ul className="space-y-2 text-gray-700">
                        {content.map((line, i) => (
                          line.trim() && (
                            <li key={i} className="flex items-start">
                              <span className="text-indigo-600 mr-2">•</span>
                              <span>{line.replace("- ", "")}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {result.missingKeywords && (
                  <div className="bg-red-50 rounded-lg p-5 shadow-sm">
                    <h3 className="text-xl font-semibold text-red-900 mb-3">Missing Keywords</h3>
                    <p className="text-gray-700">{result.missingKeywords.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSChecker;