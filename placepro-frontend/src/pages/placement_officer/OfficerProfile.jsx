import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const OfficerProfile = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("OfficerProfile - userData:", userData);
    if (!userData || userData.role !== "placement_officer") {
      toast.error("Access denied. Placement Officer role required.");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/officer/profile`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setProfile(response.data.profileData);
        } else {
          toast.error(response.data.message || "Failed to fetch officer profile");
          navigate("/officer");
        }
      } catch (error) {
        console.error("Error fetching officer profile:", error);
        toast.error(error.response?.data?.message || "Error fetching officer profile");
        navigate("/officer");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, userData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Placement Officer Profile
        </h1>
        <div className="flex flex-col items-center space-y-4">
          <img
            src={profile.profileImage || "https://via.placeholder.com/150"}
            alt={profile.name || "Profile"}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">{profile.name || "N/A"}</h2>
            <p className="text-gray-600">{profile.email || "N/A"}</p>
            <p className="text-sm text-gray-500 mt-1">Role: Placement Officer</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Officer Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;