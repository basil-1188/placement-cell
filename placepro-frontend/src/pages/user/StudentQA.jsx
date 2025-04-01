import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

const StudentQA = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [qas, setQAs] = useState([]);
  const [filteredQAs, setFilteredQAs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQA, setExpandedQA] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied: Student role required.");
      window.location.href = "/login";
      return;
    }
    fetchQA();
  }, [backendUrl, userData]);

  const fetchQA = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/qa`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setQAs(response.data.data);
        setFilteredQAs(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch Q&A");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching Q&A");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = qas.filter((qa) => {
      return (
        qa.title.toLowerCase().includes(query) ||
        qa.content.toLowerCase().includes(query) ||
        (qa.description && qa.description.toLowerCase().includes(query)) ||
        qa.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
    setFilteredQAs(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedQA(expandedQA === id ? null : id);
  };

  const parseQAContent = (content) => {
    const qaPairs = [];
    const regex = /(\d+\)\s+[^.?!]+[.?!])([\s\S]*?(?=\d+\)|$))/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim() || "No detailed answer provided.";
      qaPairs.push({ question, answer });
    }

    if (qaPairs.length === 0 && content) {
      qaPairs.push({ question: "General Content", answer: content });
    }

    return qaPairs;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl font-extrabold text-blue-900">Interview Prep Hub</h1>
          <p className="mt-2 text-lg text-gray-600 font-medium">
            Ace your interviews with top-tier Q&As
          </p>
          <div className="relative w-full max-w-lg mx-auto mt-6">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Q&As..."
              className="w-full p-4 pl-12 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 shadow-md transition-all duration-200"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg" />
          </div>
        </div>

        {filteredQAs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-blue-100">
            <p className="text-gray-700 text-xl font-semibold">
              {searchQuery ? "No matches found!" : "Nothing here yet!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredQAs.map((qa) => {
              const qaPairs = parseQAContent(qa.content);
              return (
                <div
                  key={qa._id}
                  className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transform hover:scale-102 transition-transform duration-200"
                >
                  <div
                    className="flex justify-between items-center p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => toggleExpand(qa._id)}
                  >
                    <h2 className="text-lg font-bold text-blue-900 truncate">{qa.title}</h2>
                    <span className="text-blue-600">
                      {expandedQA === qa._id ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>

                  {expandedQA === qa._id && (
                    <div className="p-5">
                      {qa.description && (
                        <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                          <p className="text-blue-800 text-sm font-semibold">Description</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{qa.description}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {qaPairs.map((pair, index) => (
                          <div key={index} className="space-y-2">
                            <p className="text-blue-700 font-semibold text-md">{pair.question}</p>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-2 rounded-md">
                              {pair.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 text-sm text-gray-700">
                    <p className="font-medium">
                      By: <span className="text-blue-800">{qa.author?.name || "Unknown"}</span>
                    </p>
                    <p className="font-medium">
                      Updated: <span className="text-blue-800">{new Date(qa.updatedAt).toLocaleDateString()}</span>
                    </p>
                    {qa.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {qa.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQA;