// components/student/StudentJobsList.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaChevronDown, FaLink, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const StudentJobsList = () => {
  const { backendUrl } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [studentMarks, setStudentMarks] = useState(null);
  const [isEligible, setIsEligible] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Backend URL:", backendUrl);
    const fetchData = async () => {
      try {
        console.log("Fetching jobs from:", `${backendUrl}/api/user/get-job-openings`);
        const jobResponse = await axios.get(`${backendUrl}/api/user/get-job-openings`, {
          withCredentials: true,
        });
        console.log("Job Response:", jobResponse.data);
        if (jobResponse.data.success) {
          setJobs(jobResponse.data.data || []);
          console.log("Jobs set:", jobResponse.data.data || []);
        } else {
          toast.error(jobResponse.data.message || "Failed to fetch jobs");
          setJobs([]);
        }

        console.log("Fetching marks from:", `${backendUrl}/api/user/marks`);
        const marksResponse = await axios.get(`${backendUrl}/api/user/marks`, {
          withCredentials: true,
        });
        console.log("Marks Response:", marksResponse.data);
        if (marksResponse.data.success) {
          setStudentMarks(marksResponse.data.marks);
        } else {
          toast.warn(marksResponse.data.message || "Failed to fetch marks; eligibility won’t be checked");
        }
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        if (error.response?.config.url.includes("marks")) {
          toast.warn("Failed to fetch marks; jobs will still display");
        } else {
          toast.error(error.response?.data?.message || "Error fetching jobs");
          setJobs([]);
        }
      } finally {
        setLoading(false);
        console.log("Loading set to false, jobs:", jobs);
      }
    };

    fetchData();
  }, [backendUrl]);

  useEffect(() => {
    if (selectedJob && studentMarks) {
      console.log("Validating eligibility for:", selectedJob);
      const validateEligibility = () => {
        let eligible = true;
        let message = "";

        const pgMarks = studentMarks.pg || [];
        const pgAverage = pgMarks.length > 0 ? pgMarks.reduce((sum, mark) => sum + mark, 0) / pgMarks.length : 0;

        if (selectedJob.eligibility.cgpa > pgAverage) {
          eligible = false;
          message += `Your PG CGPA (${pgAverage.toFixed(2)}) is below the required ${selectedJob.eligibility.cgpa}. `;
        }

        if (selectedJob.eligibility.degreeCgpa && (!studentMarks.degreeCgpa || selectedJob.eligibility.degreeCgpa > studentMarks.degreeCgpa)) {
          eligible = false;
          message += `Your Degree CGPA (${studentMarks.degreeCgpa || "N/A"}) is below the required ${selectedJob.eligibility.degreeCgpa}. `;
        }

        if (selectedJob.eligibility.plustwoPercent && (!studentMarks.plustwoPercent || selectedJob.eligibility.plustwoPercent > studentMarks.plustwoPercent)) {
          eligible = false;
          message += `Your 12th Percentage (${studentMarks.plustwoPercent || "N/A"}) is below the required ${selectedJob.eligibility.plustwoPercent}. `;
        }

        setIsEligible({ eligible, message: eligible ? "You are eligible to apply!" : message });
      };

      validateEligibility();
    }
  }, [selectedJob, studentMarks]);

  const handleJobClick = (job) => {
    const today = new Date();
    const deadline = new Date(job.applicationDeadline);
    if (deadline < today) {
      toast.info("This job's application deadline has passed.");
      return;
    }
    setSelectedJob(selectedJob && selectedJob._id === job._id ? null : job);
    setIsEligible(null);
  };

  const handleApplyLinkClick = (e, url) => {
    e.preventDefault();
    const confirmRedirect = window.confirm(
      "You are being redirected to an external site. Please ensure it’s safe before proceeding. Continue?"
    );
    if (confirmRedirect) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mt-15 mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
        Explore Job Opportunities
      </h2>
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No open job postings available at the moment.</p>
          <p className="text-gray-400 mt-2">Check back later for exciting opportunities!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {jobs.map((job) => {
            const deadline = new Date(job.applicationDeadline);
            const isExpired = deadline < new Date();
            return (
              <div
                key={job._id}
                className="bg-white shadow-xl rounded-xl overflow-hidden transform transition-all hover:shadow-2xl"
              >
                <div
                  onClick={() => handleJobClick(job)}
                  className={`p-6 cursor-pointer flex items-center justify-between ${
                    isExpired ? "bg-gray-100 opacity-80" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <h3
                      className={`text-2xl font-semibold flex items-center ${
                        isExpired ? "text-gray-500" : "text-indigo-600"
                      }`}
                    >
                      <FaBriefcase className="mr-3 text-indigo-500" /> {job.title}
                    </h3>
                    <p className="text-gray-700 mt-2 flex items-center">
                      <FaBuilding className="mr-2 text-gray-500" /> {job.company}
                    </p>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" /> Last Date: {deadline.toDateString()}
                    </p>
                    {isExpired && (
                      <p className="text-red-500 text-sm mt-2 font-medium">Application Deadline Passed</p>
                    )}
                  </div>
                  <FaChevronDown
                    className={`text-gray-500 transform transition-transform ${
                      selectedJob && selectedJob._id === job._id && !isExpired ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {selectedJob && selectedJob._id === job._id && !isExpired && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200 animate__animated animate__fadeIn">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                        <p className="text-gray-600 mt-2 leading-relaxed">{job.description}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Eligibility Criteria</h3>
                        <ul className="list-disc pl-6 text-gray-600 mt-2">
                          <li>PG CGPA: {job.eligibility.cgpa}</li>
                          <li>Skills: {job.eligibility.skills.join(", ")}</li>
                          {job.eligibility.degreeCgpa && <li>Degree CGPA: {job.eligibility.degreeCgpa}</li>}
                          {job.eligibility.plustwoPercent && (
                            <li>12th Percentage: {job.eligibility.plustwoPercent}</li>
                          )}
                        </ul>
                      </div>
                      {job.applyLink && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Apply Now</h3>
                          <a
                            href={job.applyLink}
                            onClick={(e) => handleApplyLinkClick(e, job.applyLink)}
                            className="inline-flex items-center mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <FaLink className="mr-2" /> Apply
                          </a>
                        </div>
                      )}
                      {isEligible !== null && (
                        <div className="mt-6 p-4 rounded-lg bg-white shadow-inner">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            Your Eligibility
                            {isEligible.eligible ? (
                              <FaCheckCircle className="ml-2 text-green-500" />
                            ) : (
                              <FaTimesCircle className="ml-2 text-red-500" />
                            )}
                          </h3>
                          <p
                            className={`mt-2 text-lg ${
                              isEligible.eligible ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isEligible.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentJobsList;