import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";

const CampusDriveApplication = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    admnNo: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/student-details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setFormData((prev) => ({
            ...prev,
            admnNo: response.data.data.admnNo || "",
            phone: response.data.data.phoneNo || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    fetchStudentDetails();
  }, [backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/apply-campus-drive`,
        { jobId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Application submitted successfully!");
        navigate("/user/jobs");
      } else {
        toast.error(response.data.message || "Failed to submit application");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Apply for Campus Drive</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled
            />
          </div>

          <div>
            <label htmlFor="admnNo" className="block text-sm font-medium text-gray-700">
              Admission Number
            </label>
            <input
              type="text"
              name="admnNo"
              value={formData.admnNo}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 9876543210"
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
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampusDriveApplication;