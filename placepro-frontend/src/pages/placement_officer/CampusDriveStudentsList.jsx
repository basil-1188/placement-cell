import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { FaEnvelope } from "react-icons/fa"; // Add react-icons for a nice envelope icon

const CampusDriveStudents = () => {
  const { backendUrl } = useContext(AppContext);
  const { jobId } = useParams();
  const [students, setStudents] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [emailContent, setEmailContent] = useState({
    subject: "",
    message: "",
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false); // Toggle for email form visibility

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/campus-drive-students/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setStudents(response.data.data);
          if (response.data.data.length > 0) {
            setJobDetails(response.data.data[0].jobId);
          }
        } else {
          toast.error(response.data.message || "Failed to fetch students");
          setStudents([]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [backendUrl, jobId]);

  const downloadCSV = () => {
    const headers = ["Student Name", "Email", "Job Title", "Company"];
    const rows = students.map((app) => [
      app.studentId.name,
      app.studentId.email,
      app.jobId.title,
      app.jobId.company,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${jobDetails.title || "campus_drive"}_students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailContent((prev) => ({ ...prev, [name]: value }));
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!emailContent.subject || !emailContent.message) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setEmailLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/officer/send-campus-drive-email`,
        {
          jobId,
          subject: emailContent.subject,
          message: emailContent.message,
          recipients: students.map((app) => app.studentId.email),
          jobTitle: jobDetails.title,
          company: jobDetails.company,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Email sent successfully to all applicants!");
        setEmailContent({ subject: "", message: "" });
        setShowEmailForm(false); // Hide form after success
      } else {
        toast.error(response.data.message || "Failed to send email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending email");
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mt-15 mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
        Applicants for {jobDetails.title} at {jobDetails.company}
      </h2>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No students have applied for this campus drive yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowEmailForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              disabled={emailLoading}
            >
              <FaEnvelope className="mr-2" /> Send Update
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Download as CSV
            </button>
          </div>

          {/* Email Modal */}
          {showEmailForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Send Update to Applicants</h3>
                  <button
                    onClick={() => setShowEmailForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={sendEmail} className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={emailContent.subject}
                      onChange={handleEmailChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Campus Drive Schedule Update"
                      disabled={emailLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={emailContent.message}
                      onChange={handleEmailChange}
                      rows="5"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Dear students, the campus drive is scheduled for April 15, 2025, at 10 AM. Prepare accordingly."
                      disabled={emailLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={emailLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className={`px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors ${
                        emailLoading ? "bg-indigo-400 cursor-not-allowed" : ""
                      }`}
                    >
                      {emailLoading ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.studentId.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.studentId.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusDriveStudents;