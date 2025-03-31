import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { FaBriefcase, FaCalendarAlt } from "react-icons/fa";

const CampusDriveList = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [campusDrives, setCampusDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampusDrives = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/campus-drives`, { 
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setCampusDrives(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch campus drives");
          setCampusDrives([]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching campus drives");
        setCampusDrives([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampusDrives();
  }, [backendUrl]);

  const handleViewApplicants = (jobId) => {
    navigate(`/officer/campus-drive-students/${jobId}`);
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
    <div className="max-w-5xl mt-15 mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
        Campus Drive Jobs
      </h2>
      {campusDrives.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No campus drives available.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {campusDrives.map((job) => (
            <div
              key={job._id}
              className="bg-white shadow-xl rounded-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-indigo-600 flex items-center">
                  <FaBriefcase className="mr-3 text-indigo-500" /> {job.title}
                </h3>
                <p className="text-gray-700 mt-2">{job.company}</p>
                <p className="text-gray-600 mt-1 flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" /> Last Date: {new Date(job.applicationDeadline).toDateString()}
                </p>
              </div>
              <button
                onClick={() => handleViewApplicants(job._id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Applicants
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusDriveList;