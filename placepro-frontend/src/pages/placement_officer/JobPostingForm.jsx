// components/officer/JobPostingForm.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";

const JobPostingForm = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    eligibility: { cgpa: "", skills: "", degreeCgpa: "", plustwoPercent: "" },
    applicationDeadline: "",
    applyLink: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("eligibility.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        eligibility: { ...prev.eligibility, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = formData.eligibility.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);

    if (skillsArray.length === 0) {
      toast.error("Please provide at least one skill");
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      company: formData.company,
      description: formData.description,
      eligibility: {
        cgpa: parseFloat(formData.eligibility.cgpa),
        skills: skillsArray,
        ...(formData.eligibility.degreeCgpa && { degreeCgpa: parseFloat(formData.eligibility.degreeCgpa) }),
        ...(formData.eligibility.plustwoPercent && { plustwoPercent: parseFloat(formData.eligibility.plustwoPercent) }),
      },
      applicationDeadline: formData.applicationDeadline,
      applyLink: formData.applyLink || undefined,
    };

    try {
      const url = `${backendUrl}/api/officer/job-posting`; // Updated to match backend route
      console.log("Current path:", window.location.pathname); // Debug
      console.log("Request method:", "POST"); // Debug
      console.log("Posting to:", url); // Debug
      console.log("Payload:", payload); // Debug
      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Job posted successfully!");
        navigate("/officer/dashboard");
      } else {
        toast.error(response.data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error:", error.response); // Debug
      toast.error(error.response?.data?.message || "Error posting job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-10 bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Post a New Job Opening</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              id="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., TechCorp"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe the job responsibilities and requirements..."
            />
          </div>

          <div>
            <label htmlFor="eligibility.cgpa" className="block text-sm font-medium text-gray-700">
              Minimum PG CGPA <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="eligibility.cgpa"
              id="eligibility.cgpa"
              value={formData.eligibility.cgpa}
              onChange={handleChange}
              required
              min="0"
              max="10"
              step="0.1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 8.1"
            />
            <p className="mt-1 text-xs text-gray-500">Range: 0–10</p>
          </div>

          <div>
            <label htmlFor="eligibility.skills" className="block text-sm font-medium text-gray-700">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="eligibility.skills"
              id="eligibility.skills"
              value={formData.eligibility.skills}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Enter skills separated by commas</p>
          </div>

          <div>
            <label htmlFor="eligibility.degreeCgpa" className="block text-sm font-medium text-gray-700">
              Minimum Degree CGPA (Optional)
            </label>
            <input
              type="number"
              name="eligibility.degreeCgpa"
              id="eligibility.degreeCgpa"
              value={formData.eligibility.degreeCgpa}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 8.0"
            />
            <p className="mt-1 text-xs text-gray-500">Range: 0–10 (leave blank if not required)</p>
          </div>

          <div>
            <label htmlFor="eligibility.plustwoPercent" className="block text-sm font-medium text-gray-700">
              Minimum 12th Percentage (Optional)
            </label>
            <input
              type="number"
              name="eligibility.plustwoPercent"
              id="eligibility.plustwoPercent"
              value={formData.eligibility.plustwoPercent}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 85"
            />
            <p className="mt-1 text-xs text-gray-500">Range: 0–100 (leave blank if not required)</p>
          </div>

          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="applicationDeadline"
              id="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="applyLink" className="block text-sm font-medium text-gray-700">
              Application Link (Optional)
            </label>
            <input
              type="url"
              name="applyLink"
              id="applyLink"
              value={formData.applyLink}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., https://techcorp.com/apply"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? "Posting..." : "Post Job Opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;