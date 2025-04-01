import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaSearch } from "react-icons/fa";

const MaterialsUser = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) {
      toast.error("Please log in to access materials.");
      window.location.href = "/login";
      return;
    }

    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/user-materials`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setMaterials(response.data.data);
          setFilteredMaterials(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch materials");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching materials");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [backendUrl, userData]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = materials.filter(
      (material) =>
        material.title.toLowerCase().includes(query) ||
        (material.description && material.description.toLowerCase().includes(query)) ||
        material.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        material.content.toLowerCase().includes(query)
    );
    setFilteredMaterials(filtered);
  };

  const handleDownload = (materialUrl, materialTitle) => {
    const link = document.createElement("a");
    link.href = materialUrl;
    link.download = `${materialTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Material downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-8 bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Learning Resources
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Access top-tier study materials designed to boost your skills and knowledge.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 max-w-3xl mx-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search materials by title, description, or tags..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 placeholder-gray-500 transition-all duration-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              {searchQuery ? "No matching materials found" : "No Resources Available"}
            </h2>
            <p className="mt-2 text-gray-500">
              {searchQuery ? "Try a different search term." : "Check back later for new study materials!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <div
                key={material._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative h-48">
                  {material.thumbnail ? (
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">PDF</span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Published
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-1 mb-2">
                    {material.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {material.description || "No description available"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {material.tags.length > 0 ? (
                      material.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No tags</span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs mb-4">
                    <p>Last Updated: {new Date(material.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(material.content, material.title)}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Get Material
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsUser;