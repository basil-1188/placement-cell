import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const Materials = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "training_team") {
      toast.error("Access denied. Training Team role required.");
      window.location.href = "/login";
      return;
    }

    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/team/study-materials?type=study_material`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (response.data.success) {
          setMaterials(response.data.data);
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

  const handleDelete = async (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    if (material.author._id.toString() !== userData._id.toString()) {
      toast.error("You can only delete your own materials.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/team/study-materials/${materialId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setMaterials(materials.filter((m) => m._id !== materialId));
        toast.success("Material deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete material");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting material");
    }
  };

  const handlePublish = async (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    if (material.author._id.toString() !== userData._id.toString()) {
      toast.error("You can only publish your own materials.");
      return;
    }
    try {
      const response = await axios.put(
        `${backendUrl}/api/team/study-materials/${materialId}`,
        { status: "published" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setMaterials(materials.map((m) => (m._id === materialId ? { ...m, status: "published" } : m)));
        toast.success("Material published successfully");
      } else {
        toast.error(response.data.message || "Failed to publish material");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error publishing material");
    }
  };

  const openModal = (material = null) => {
    if (material && material.author._id.toString() !== userData._id.toString()) {
      toast.error("You can only edit your own materials.");
      return;
    }
    setSelectedMaterial(material);
    setShowModal(true);
  };

  const handleSave = (updatedMaterial) => {
    if (selectedMaterial) {
      setMaterials(materials.map((m) => (m._id === updatedMaterial._id ? updatedMaterial : m)));
    } else {
      setMaterials([...materials, updatedMaterial]);
    }
    setShowModal(false);
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
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Manage Study Materials
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Create, edit, and publish resources for your students.
          </p>
          <button
            onClick={() => openModal()}
            className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FaPlus className="mr-2" /> Add New Material
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">No Materials Available</h2>
            <p className="mt-2 text-gray-500">Start by adding a new study material!</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <div
                key={material._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Thumbnail or Placeholder */}
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
                  <span
                    className={`absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded-full ${
                      material.status === "published" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                  </span>
                </div>

                {/* Content */}
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
                    <p>
                      <a
                        href={material.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Material
                      </a>
                    </p>
                  </div>
                  {material.author._id.toString() === userData._id.toString() && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(material)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors duration-200"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      {material.status === "draft" && (
                        <button
                          onClick={() => handlePublish(material._id)}
                          className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200"
                          title="Publish"
                        >
                          <FaPlus size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <MaterialModal
            material={selectedMaterial}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
            backendUrl={backendUrl}
          />
        )}
      </div>
    </div>
  );
};

const MaterialModal = ({ material, onClose, onSave, backendUrl }) => {
  const [formData, setFormData] = useState({
    title: material?.title || "",
    file: null,
    description: material?.description || "",
    tags: material?.tags?.join(", ") || "",
    thumbnail: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData();
    form.append("title", formData.title);
    if (formData.file) form.append("file", formData.file);
    form.append("description", formData.description);
    form.append("tags", formData.tags);
    if (formData.thumbnail) form.append("thumbnail", formData.thumbnail);

    try {
      const url = material
        ? `${backendUrl}/api/team/study-materials/${material._id}`
        : `${backendUrl}/api/team/study-materials`;
      const method = material ? "put" : "post";
      const response = await axios({
        method,
        url,
        data: form,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(material ? "Material updated successfully" : "Material added successfully");
        onSave(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || "Failed to save material");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error saving material";
      toast.error(errorMessage);
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {material ? "Edit Material" : "Add New Material"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-1">PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={!material}
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-1">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
              className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Materials;