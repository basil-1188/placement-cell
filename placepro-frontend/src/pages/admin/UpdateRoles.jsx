import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/admin/AdminSidebar";

const UpdateRoles = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        console.log("Fetching all users");
        const response = await axios.get(`${backendUrl}/api/admin/users`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const nonAdminUsers = response.data.users.filter((user) => user.role !== "admin");
          setUsers(nonAdminUsers);
          if (userId) {
            const user = nonAdminUsers.find((u) => u._id === userId);
            if (user) {
              setSelectedUser(user);
              setNewRole("");
            }
          }
        } else {
          toast.error(response.data.message || "Failed to fetch users");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(error.response?.data?.message || "Error fetching users");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backendUrl, userData, navigate, userId]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setNewRole("");
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }
    console.log("Current role:", selectedUser.role, "New role:", newRole);
    if (!newRole || newRole === selectedUser.role) {
      toast.info("No role change detected");
      return;
    }

    try {
      const response = await axios.patch(
        `${backendUrl}/api/admin/update-role`,
        { userId: selectedUser._id, role: newRole },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Role updated successfully!");
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(response.data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error.response?.data, error.response?.status);
      toast.error(error.response?.data?.message || "Error updating role");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <motion.div
        className={`flex-1 p-6 transition-all duration-300 ${
          isMinimized ? "md:ml-16" : "md:ml-64"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Update User Roles</h1>

          {!selectedUser ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Select a User</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <motion.div
                    key={user._id}
                    className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                    onClick={() => handleUserSelect(user)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={user.profileImage || "https://via.placeholder.com/50"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                    />
                    <p className="text-gray-800 font-medium text-center">{user.name}</p>
                    <p className="text-gray-600 text-sm text-center">{user.email}</p>
                    <p className="text-gray-500 text-sm text-center">Role: {user.role}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={selectedUser.profileImage || "https://via.placeholder.com/100"}
                alt={selectedUser.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200"
              />
              <h2 className="text-xl font-semibold text-gray-700">{selectedUser.name}</h2>
              <p className="text-gray-600">{selectedUser.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Current Role: <span className="font-medium">{selectedUser.role}</span>
              </p>

              <div className="w-full mt-6">
                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                  Select New Role
                </label>
                <select
                  id="role"
                  value={newRole}
                  onChange={(e) => {
                    console.log("Selected role:", e.target.value);
                    setNewRole(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select a new role
                  </option>
                  <option value="student">Student</option>
                  <option value="placement_officer">Placement Officer</option>
                  <option value="training_team">Training Team</option>
                </select>
              </div>

              <motion.button
                onClick={handleRoleUpdate}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Update Role
              </motion.button>

              <motion.button
                onClick={() => setSelectedUser(null)}
                className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to User List
              </motion.button>
            </div>
          )}

          <motion.button
            onClick={() => navigate("/admin")}
            className="w-full mt-6 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Admin Panel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateRoles;