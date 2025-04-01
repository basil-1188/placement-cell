import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp, FaSpinner, FaSearch } from "react-icons/fa";

const TeamQA = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [qas, setQAs] = useState([]);
  const [filteredQAs, setFilteredQAs] = useState([]); // New state for filtered results
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    tags: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [expandedQA, setExpandedQA] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "training_team") {
      toast.error("Access denied: Training Team role required.");
      window.location.href = "/login";
      return;
    }
    fetchQA();
  }, [backendUrl, userData]);

  const fetchQA = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/team/qa`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setQAs(response.data.data);
        setFilteredQAs(response.data.data); // Initially, filteredQAs matches all Q&As
      } else {
        toast.error(response.data.message || "Failed to fetch Q&A");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching Q&A");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change and filter Q&As
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = {
      title: formData.title,
      content: formData.content,
      description: formData.description,
      tags: formData.tags,
    };

    try {
      if (editingId) {
        const response = await axios.put(`${backendUrl}/api/team/qa/${editingId}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        toast.success(response.data.message || "Q&A updated successfully!");
      } else {
        const response = await axios.post(`${backendUrl}/api/team/qa`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        toast.success(response.data.message || "Q&A uploaded successfully!");
      }
      resetForm();
      fetchQA();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting Q&A");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (qa) => {
    if (qa.author._id.toString() !== userData._id.toString()) {
      toast.error("You can only edit your own Q&A.");
      return;
    }
    setEditingId(qa._id);
    setFormData({
      title: qa.title,
      content: qa.content,
      description: qa.description || "",
      tags: qa.tags.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;
    setDeletingId(id);
    try {
      const response = await axios.delete(`${backendUrl}/api/team/qa/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      toast.success(response.data.message || "Q&A deleted successfully!");
      fetchQA();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting Q&A");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id) => {
    try {
      const response = await axios.put(`${backendUrl}/api/team/qa/publish/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      toast.success(response.data.message || "Q&A published successfully!");
      fetchQA();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error publishing Q&A");
    }
  };

  const toggleExpand = (id) => {
    setExpandedQA(expandedQA === id ? null : id);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", description: "", tags: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Manage Questions & Answers</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Add, edit, and publish Q&A content for students.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaPlus className="mr-2" /> Add New Q&A
            </button>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search Q&As by title, content, or tags..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 placeholder-gray-500 transition-all duration-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {filteredQAs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg font-medium">
              {searchQuery ? "No Q&As match your search." : "No Q&A content available yet. Start by adding one!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQAs.map((qa) => (
              <div
                key={qa._id}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(qa._id)}
                >
                  <h2 className="text-xl font-bold text-gray-800 truncate">{qa.title}</h2>
                  {expandedQA === qa._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedQA === qa._id && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{qa.content}</p>
                    {qa.description && (
                      <p className="text-gray-500 text-sm italic">Description: {qa.description}</p>
                    )}
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        qa.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {qa.status}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Updated:</span>{" "}
                    {new Date(qa.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {qa.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {qa.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(qa)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(qa._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1 disabled:text-red-400 disabled:cursor-not-allowed"
                      disabled={deletingId === qa._id}
                    >
                      {deletingId === qa._id ? (
                        <>
                          <FaSpinner className="animate-spin" /> Deleting...
                        </>
                      ) : (
                        <FaTrash size={18} />
                      )}
                    </button>
                  </div>
                  {qa.status === "draft" && (
                    <button
                      onClick={() => handlePublish(qa._id)}
                      className="flex items-center bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-all duration-200"
                    >
                      <FaPaperPlane className="mr-1" /> Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes size={24} />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text">
                {editingId ? "Edit Q&A" : "Add New Q&A"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Amazon Interview Questions 2023"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Questions & Answers</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter questions and answers like this:&#10;1) Your question here. Your answer here.&#10;2) Another question? Another answer...&#10;Separate each question and answer with a number and parenthesis, e.g., '1)', followed by the question and its answer."
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    rows="6"
                    required
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., 2023, Amazon, Interview"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      editingId ? "Update" : "Save as Draft"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamQA;