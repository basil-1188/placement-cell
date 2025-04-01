import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { FaChevronDown, FaChevronUp, FaVideo } from "react-icons/fa";
import ReactPlayer from "react-player";

const UserVideos = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null);

  useEffect(() => {
    if (!userData || userData.role !== "student") {
      toast.error("Access denied: Student role required.");
      window.location.href = "/login";
      return;
    }
    fetchVideos();
  }, [backendUrl, userData]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/user-videos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setVideos(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch videos");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching videos");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedVideo(expandedVideo === id ? null : id);
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Training Videos</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore video resources prepared for your learning.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg font-medium">No videos available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(video._id)}
                >
                  <h2 className="text-xl font-bold text-gray-800 truncate">{video.title}</h2>
                  {expandedVideo === video._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedVideo === video._id && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-2">{video.description || "No description"}</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {video.source === "youtube" ? (
                        <div className="relative pt-[56.25%]">
                          <ReactPlayer
                            url={video.content}
                            width="100%"
                            height="100%"
                            controls={true}
                            className="absolute top-0 left-0 rounded-lg overflow-hidden"
                            config={{
                              youtube: {
                                playerVars: { modestbranding: 1, rel: 0 },
                              },
                            }}
                          />
                        </div>
                      ) : (
                        video.content.split(",").map((url, index) => (
                          <div key={index} className="mb-4 last:mb-0">
                            <h3 className="text-gray-700 font-medium mb-2">Part {index + 1}</h3>
                            <div className="relative pt-[56.25%]">
                              <ReactPlayer
                                url={url}
                                width="100%"
                                height="100%"
                                controls={true}
                                className="absolute top-0 left-0 rounded-lg overflow-hidden"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Source:</span> {video.source === "youtube" ? "YouTube" : "Uploaded"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Duration:</span>{" "}
                    {video.duration ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s` : "N/A"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Author:</span> {video.author?.name || "Unknown"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Updated:</span>{" "}
                    {new Date(video.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {video.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVideos;