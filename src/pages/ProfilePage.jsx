import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegistrations, clearRegistrationError, updatePaymentStatus } from "../redux/slices/registrationSlice";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Users, Code2, GraduationCap, UserPlus } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const { registrations, loading, error } = useSelector((state) => state.registrations);

  const [activeTab, setActiveTab] = useState("registrations"); // "registrations" or "team"
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null for add mode, member object for edit mode
  
  // Modal form states
  const [modalForm, setModalForm] = useState({
    name: "",
    role: "Team Member",
    branch: "",
    year: "",
    linkedinUrl: "",
    order: "0",
  });
  const [modalImage, setModalImage] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/team`);
      setTeamMembers(response.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members");
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setModalForm({
      name: "",
      role: "Team Member",
      branch: "",
      year: "",
      linkedinUrl: "",
      order: "0",
    });
    setModalImage(null);
    setModalImagePreview("");
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setModalForm({
      name: member.name || "",
      role: member.role || "Team Member",
      branch: member.branch || "",
      year: member.year || "",
      linkedinUrl: member.linkedinUrl || "",
      order: String(member.order || 0),
    });
    setModalImage(null);
    setModalImagePreview(member.profileImage || "");
    setShowAddEditModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalImage(file);
      setModalImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember && !modalImage) {
      toast.error("Profile image is required for new team members");
      return;
    }

    setIsSaving(true);
    const payload = new FormData();
    Object.entries(modalForm).forEach(([key, value]) => payload.append(key, value));
    if (modalImage) {
      payload.append("profileImage", modalImage);
    }

    try {
      if (editingMember) {
        // Update
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/team/${editingMember._id}`,
          payload,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success(res.data?.message || "Team member updated successfully");
      } else {
        // Create
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/team`,
          payload,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success(res.data?.message || "Team member added successfully");
      }
      setShowAddEditModal(false);
      fetchTeamMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/team/${id}`,
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Team member deleted successfully");
      fetchTeamMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team member");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin" && activeTab === "team") {
      fetchTeamMembers();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      const role = user.role;
      dispatch(fetchRegistrations({ userId, role }));
    }
  }, [dispatch, user, userId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRegistrationError());
    }
  }, [error, dispatch]);

  const handlePaymentStatus = async (registrationId, paymentStatus) => {
    const result = await dispatch(updatePaymentStatus({ registrationId, paymentStatus }));

    if (updatePaymentStatus.fulfilled.match(result)) {
      toast.success(`Payment ${paymentStatus}`);
      dispatch(fetchRegistrations({ userId, role: user.role }));
    } else {
      toast.error(result.payload || "Failed to update payment status");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            {user.role === "admin" ? (
              <>
                <span className="text-teal-400">ADMIN</span> DASHBOARD
              </>
            ) : (
              <>
                MY <span className="text-teal-400">PROFILE</span>
              </>
            )}
          </h1>
          <p className="text-gray-500 font-mono text-sm">
            {user.role === "admin" ? "> System Administrator" : "> Member Dashboard"}
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-[#0F1A24]/90 to-black/90 backdrop-blur-md rounded-2xl p-8 mb-8 border-2 border-teal-500/30 shadow-2xl relative overflow-hidden"
        >
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-teal-400/50"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-teal-400/50"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-teal-400/50"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-teal-400/50"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              User Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Name</p>
                  <p className="text-white font-semibold">{user.name}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Email</p>
                  <p className="text-white font-semibold break-all">{user.email}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Role</p>
                  <p className="text-white font-semibold uppercase">{user.role}</p>
                </div>
              </motion.div>

              {user.role === "admin" && (
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-mono">Total Registrations</p>
                    <p className="text-white font-semibold text-2xl">{registrations.length}</p>
                  </div>
                </motion.div>
              )}

              {user.role === "admin" && (
                <Link
                  to="/team-signup"
                  className="flex items-center gap-4 p-4 bg-teal-500/10 rounded-lg border border-teal-500/30 hover:border-teal-300 transition"
                >
                  <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-mono">Team Invite Link</p>
                    <p className="text-white font-semibold">Open Team Member Signup</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Admin Navigation Tabs */}
        {user.role === "admin" && (
          <div className="flex gap-6 border-b border-teal-500/20 mb-8 pb-1">
            <button
              onClick={() => setActiveTab("registrations")}
              className={`pb-3 px-2 font-bold font-mono tracking-wider transition relative text-sm ${
                activeTab === "registrations" ? "text-teal-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              REGISTRATIONS
              {activeTab === "registrations" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`pb-3 px-2 font-bold font-mono tracking-wider transition relative text-sm ${
                activeTab === "team" ? "text-teal-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              MANAGE TEAM
              {activeTab === "team" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-400"
                />
              )}
            </button>
          </div>
        )}

        {/* Registrations Section */}
        {activeTab === "registrations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Code2 className="w-8 h-8 text-teal-400" />
                {user.role === "admin" ? "ALL REGISTRATIONS" : "YOUR EVENTS"}
              </h2>
              {!loading && registrations.length > 0 && (
                <div className="px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                  <span className="text-teal-400 font-bold font-mono">{registrations.length}</span>
                  <span className="text-gray-400 ml-2 text-sm">Total</span>
                </div>
              )}
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center"
              >
                <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-mono">Loading registrations...</p>
              </motion.div>
            ) : registrations.length > 0 ? (
              <div className="space-y-4">
                {registrations.map((r, index) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="bg-gradient-to-r from-[#0F1A24]/80 to-black/80 backdrop-blur-md rounded-xl p-6 border border-teal-500/30 hover:border-teal-400/50 transition-all shadow-lg relative overflow-hidden group"
                  >
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                      {/* User Info - Admin Only */}
                      {user.role === "admin" && (
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-lg">{r.userId?.name}</p>
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {r.userId?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              Roll: {r.userId?.rollno}
                            </span>
                            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-mono">
                              {r.userId?.branch}
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-mono">
                              Year {r.userId?.year}
                            </span>
                            <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-xs font-mono">
                              Payment: {r.paymentStatus || "free"}
                            </span>
                          </div>
                          {r.paymentScreenshot && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <a
                                href={r.paymentScreenshot}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-xs font-mono"
                              >
                                View Screenshot
                              </a>
                              {r.paymentStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handlePaymentStatus(r._id, "approved")}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePaymentStatus(r._id, "rejected")}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="text-teal-400 font-bold text-lg mb-2">{r.eventId?.title}</p>
                            <p className="text-gray-500 text-sm mb-2">
                              Amount: Rs. {r.amount || r.eventId?.fee || 0} | Payment: {r.paymentStatus || "free"}
                            </p>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(r.eventId?.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-teal-400">→</span>
                              <span>
                                {new Date(r.eventId?.endDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Border Animation */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center"
              >
                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-teal-400" />
                </div>
                <p className="text-gray-400 text-lg font-mono">
                  {user.role === "admin" 
                    ? "No registrations found in the system." 
                    : "You haven't registered for any events yet."}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {user.role !== "admin" && "Check out our upcoming events!"}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Manage Team Section */}
        {activeTab === "team" && user.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-teal-400" />
                MANAGE TEAM MEMBERS
              </h2>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-lg transition shadow-lg text-sm"
              >
                <UserPlus className="w-5 h-5" />
                Add Team Member
              </button>
            </div>

            {loadingTeam ? (
              <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center">
                <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-mono text-sm">Loading team members...</p>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-gradient-to-r from-[#0F1A24]/85 to-black/85 backdrop-blur-md rounded-xl p-5 border border-teal-500/30 hover:border-teal-400/50 transition relative overflow-hidden group flex gap-4 items-center"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-teal-400/50 flex-shrink-0 bg-gray-900">
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-bold text-lg truncate">{member.name}</h3>
                        <span className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded text-teal-400 text-xs font-mono">
                          Order: {member.order}
                        </span>
                      </div>
                      <p className="text-teal-400 text-sm font-semibold truncate mb-1">{member.role}</p>
                      <p className="text-gray-400 text-xs truncate">
                        {member.branch ? `${member.branch} - ` : ""}Year {member.year || "N/A"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-lg text-xs font-bold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center">
                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-teal-400" />
                </div>
                <p className="text-gray-400 text-lg font-mono">No team members registered yet.</p>
              </div>
            )}
          </motion.div>
        )}

      {/* Add / Edit Team Member Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24] border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-teal-400 mb-6">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Profile Image Field */}
              <div className="flex flex-col items-center gap-2 mb-4">
                {modalImagePreview ? (
                  <img
                    src={modalImagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-teal-400"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-teal-400/10 border-2 border-dashed border-teal-400/40 flex items-center justify-center">
                    <Users className="w-8 h-8 text-teal-400" />
                  </div>
                )}
                <label className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded cursor-pointer transition font-mono">
                  Select Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Role / Designation (Name ke neeche jo aayega)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Lead"
                  value={modalForm.role}
                  onChange={(e) => setModalForm({ ...modalForm, role: e.target.value })}
                  className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Branch */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE"
                    value={modalForm.branch}
                    onChange={(e) => setModalForm({ ...modalForm, branch: e.target.value })}
                    className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    placeholder="e.g. 3"
                    value={modalForm.year}
                    onChange={(e) => setModalForm({ ...modalForm, year: e.target.value })}
                    className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* LinkedIn URL */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://linkedin.com/in/..."
                    value={modalForm.linkedinUrl}
                    onChange={(e) => setModalForm({ ...modalForm, linkedinUrl: e.target.value })}
                    className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Position Order (0 = top-most)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 0"
                    value={modalForm.order}
                    onChange={(e) => setModalForm({ ...modalForm, order: e.target.value })}
                    className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-750">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 border border-gray-600 hover:border-gray-500 rounded text-gray-300 font-bold transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded transition disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
