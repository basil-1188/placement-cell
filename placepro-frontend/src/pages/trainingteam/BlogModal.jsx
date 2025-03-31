import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BlogModal = ({ blog, onClose, onSave, backendUrl, apiBase }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    content: blog?.content || "",
    tags: blog?.tags.join(", ") || "",
    status: blog?.status || "draft", // Default to draft, but only show for edits
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("tags", formData.tags);
    if (blog) data.append("status", formData.status); // Only send status for edits
    // New posts will use backend default ("draft")
    if (formData.image) data.append("image", formData.image);

    try {
      const url = blog ? `${backendUrl}${apiBase}/blogs/${blog._id}` : `${backendUrl}${apiBase}/blogs`;
      const method = blog ? "put" : "post";

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(blog ? "Blog updated successfully" : "Blog created successfully");
        const updatedBlogs = await axios.get(`${backendUrl}${apiBase}/blogs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }).then((res) => res.data.data);
        onSave(updatedBlogs);
        onClose();
      } else {
        toast.error(response.data.message || "Failed to save blog");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving blog");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {blog ? "Edit Blog" : "New Blog"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows="5"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          {blog && ( // Only show status dropdown for editing
            <div>
              <label className="block text-gray-700 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              className="w-full p-2"
              accept="image/*"
            />
            {blog?.image && !formData.image && (
              <img src={blog.image} alt="Current" className="mt-2 w-32 h-32 object-cover rounded-md" />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {blog ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;