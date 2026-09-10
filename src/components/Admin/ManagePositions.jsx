import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Search,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Phone,
  Mail,
  FileText,
  X,
  MessageCircle,
} from "lucide-react";

const DOMAINS = [
  "Technical",
  "Design & Media",
  "Events & Management",
  "Content & Outreach",
  "PR & Sponsorship",
  "General",
];

const INITIAL_FORM = {
  title: "",
  domain: "Technical",
  type: "Core Member",
  deadline: "",
  whatsappLink: "",
  requirements: "",
  responsibilities: "",
  isOpen: true,
};

export default function ManagePositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Applicants Review Modal state
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [applicantFilter, setApplicantFilter] = useState("all");

  // Fetch admin positions with full applicant info
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/positions/admin`, {
        withCredentials: true,
      });
      if (res.data?.data) {
        setPositions(res.data.data);
        if (selectedPosition) {
          const updated = res.data.data.find((p) => p._id === selectedPosition._id);
          if (updated) setSelectedPosition(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load positions:", err);
      toast.error(err.response?.data?.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pos) => {
    setEditingId(pos._id);
    setFormData({
      title: pos.title || "",
      domain: pos.domain || pos.department || "Technical",
      type: pos.type || "Core Member",
      deadline: pos.deadline ? new Date(pos.deadline).toISOString().split("T")[0] : "",
      whatsappLink: pos.whatsappLink || "",
      requirements: Array.isArray(pos.requirements) ? pos.requirements.join("\n") : "",
      responsibilities: Array.isArray(pos.responsibilities) ? pos.responsibilities.join("\n") : "",
      isOpen: pos.isOpen !== undefined ? pos.isOpen : true,
    });
    setShowModal(true);
  };

  // Save (Create or Update) Position
  const handleSavePosition = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Position title is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        domain: formData.domain,
        department: formData.domain,
        type: formData.type,
        deadline: formData.deadline || null,
        whatsappLink: formData.whatsappLink ? formData.whatsappLink.trim() : "",
        isOpen: formData.isOpen,
        requirements: formData.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
      };

      if (editingId) {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/positions/${editingId}`,
          payload,
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Position updated successfully");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/positions`,
          payload,
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Position created successfully");
      }

      setShowModal(false);
      fetchPositions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save position");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Position Status
  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/positions/${id}/toggle`,
        {},
        { withCredentials: true }
      );
      toast.success("Position status updated");
      fetchPositions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  // Delete Position
  const handleDeletePosition = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the "${title}" position?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/positions/${id}`, {
        withCredentials: true,
      });
      toast.success("Position deleted successfully");
      fetchPositions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete position");
    }
  };

  // Open Applicants Modal
  const handleViewApplicants = (pos) => {
    setSelectedPosition(pos);
    setApplicantFilter("all");
    setShowApplicantsModal(true);
  };

  // Update Applicant Status
  const handleUpdateApplicantStatus = async (posId, appId, newStatus) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/positions/${posId}/applications/${appId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `Status updated to ${newStatus}`);
      fetchPositions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update applicant status");
    }
  };

  // Delete Applicant
  const handleDeleteApplicant = async (posId, appId, name) => {
    if (!window.confirm(`Delete application for ${name}?`)) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/positions/${posId}/applications/${appId}`,
        { withCredentials: true }
      );
      toast.success("Application deleted");
      fetchPositions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete application");
    }
  };

  // Calculations for stats
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.isOpen).length;
  const totalApplications = positions.reduce(
    (acc, p) => acc + (p.applications?.length || p.applicationsCount || 0),
    0
  );

  const filteredPositions = positions.filter((pos) => {
    const posDomain = pos.domain || pos.department || "Technical";
    const matchesDomain = domainFilter === "All" || posDomain === domainFilter;
    const matchesSearch =
      pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posDomain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-left space-y-8"
    >
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-teal-400" />
            MANAGE RECRUITMENT POSITIONS
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">
            Create club openings, set WhatsApp group links, and review candidate applications.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-black font-bold font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(20,184,166,0.3)] text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Position
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0F1A24]/90 to-black/80 border border-teal-500/20 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Total Positions</span>
            <Briefcase className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{totalPositions}</p>
          <span className="text-[11px] font-mono text-teal-400/80">Configured in system</span>
        </div>

        <div className="bg-gradient-to-br from-[#0F1A24]/90 to-black/80 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Active Openings</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{activePositions}</p>
          <span className="text-[11px] font-mono text-emerald-400/80">Accepting applications</span>
        </div>

        <div className="bg-gradient-to-br from-[#0F1A24]/90 to-black/80 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Applications Received</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 mt-2">{totalApplications}</p>
          <span className="text-[11px] font-mono text-cyan-400/80">Across all domains</span>
        </div>
      </div>

      {/* Domain Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0F1A24]/80 backdrop-blur-md p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-mono text-gray-500 uppercase mr-1">Domain:</span>
          {["All", ...DOMAINS].map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                domainFilter === d
                  ? "bg-teal-400 text-black font-bold"
                  : "bg-black/40 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-gray-800 rounded-lg text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-400 transition"
          />
        </div>
      </div>

      {/* Positions List */}
      {loading ? (
        <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono text-sm">Loading positions...</p>
        </div>
      ) : filteredPositions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPositions.map((pos) => {
            const appsCount = pos.applications?.length || pos.applicationsCount || 0;
            const currentDomain = pos.domain || pos.department || "Technical";

            return (
              <div
                key={pos._id}
                className="bg-gradient-to-r from-[#0F1A24]/90 to-black/90 backdrop-blur-md rounded-2xl p-5 border border-teal-500/20 hover:border-teal-400/40 transition flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top line: Domain Badge + Status Toggle */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                      Domain: {currentDomain}
                    </span>

                    {/* Active/Closed Button */}
                    <button
                      onClick={() => handleToggleStatus(pos._id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition cursor-pointer ${
                        pos.isOpen
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                      }`}
                      title="Click to toggle status"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          pos.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                        }`}
                      />
                      {pos.isOpen ? "OPEN" : "CLOSED"}
                    </button>
                  </div>

                  {/* Title & Type */}
                  <h3 className="text-xl font-bold text-white tracking-tight">{pos.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 mt-2">
                    <span className="bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700 text-gray-300">
                      {pos.type}
                    </span>
                    {pos.deadline && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {new Date(pos.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {pos.whatsappLink && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Linked
                      </span>
                    )}
                  </div>

                  {/* Responsibilities / Requirements summary pills */}
                  {(pos.requirements?.length > 0 || pos.responsibilities?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(pos.requirements || []).slice(0, 3).map((req, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-black/40 border border-gray-800 text-[10px] font-mono text-gray-400"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleViewApplicants(pos)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span>View Applicants ({appsCount})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(pos)}
                      className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer"
                      title="Edit Position"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePosition(pos._id, pos.title)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition cursor-pointer"
                      title="Delete Position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-2xl p-12 border border-teal-500/20 text-center">
          <Briefcase className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Positions Found</h3>
          <p className="text-gray-400 text-xs font-mono mb-4">
            Click "Create Position" above to add your first recruitment opening.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Create Role Now
          </button>
        </div>
      )}

      {/* ADD / EDIT POSITION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-xl bg-[#0F1A24] border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-400" />
                {editingId ? "Edit Position" : "Create New Recruitment Position"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-gray-800/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePosition} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                    Position Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Lead / Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  />
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                    Domain
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Type */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                    Role Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Core Member">Core Member</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  />
                </div>

                {/* Is Open Toggle */}
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isOpen}
                      onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-400"></div>
                  </label>
                  <span className="text-xs font-mono text-gray-300">
                    {formData.isOpen ? "Position is Open" : "Position is Closed"}
                  </span>
                </div>

                {/* WhatsApp Group Link */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-emerald-400 mb-1 uppercase flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Group Link (Shown to students after applying)
                  </label>
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={formData.whatsappLink}
                    onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 text-white text-sm focus:border-emerald-400 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-gray-500 font-mono mt-1">
                    Students will be given a direct "Join WhatsApp Group" button upon submitting their application.
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                  Responsibilities (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Organize technical workshops&#10;Lead project development&#10;Mentor junior club members"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition font-mono text-xs resize-none"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">
                  Requirements (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Knowledge of JavaScript / React&#10;Active GitHub profile&#10;Good team communication"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition font-mono text-xs resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* VIEW APPLICANTS REVIEW MODAL */}
      {showApplicantsModal && selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl bg-[#0F1A24] border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    Domain: {selectedPosition.domain || selectedPosition.department || "Technical"}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {selectedPosition.applications?.length || 0} Total Applicants
                  </span>
                  {selectedPosition.whatsappLink && (
                    <a
                      href={selectedPosition.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp Group Link
                    </a>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Applicants: {selectedPosition.title}
                </h3>
              </div>
              <button
                onClick={() => setShowApplicantsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-gray-800/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 px-6 py-3 bg-black/40 border-b border-gray-800 overflow-x-auto">
              {[
                { id: "all", label: "All Applicants" },
                { id: "pending", label: "Pending" },
                { id: "shortlisted", label: "Shortlisted" },
                { id: "accepted", label: "Accepted" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setApplicantFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer whitespace-nowrap ${
                    applicantFilter === tab.id
                      ? "bg-teal-400 text-black font-bold"
                      : "bg-gray-800/60 text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Applicants List Area */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {(() => {
                const apps = (selectedPosition.applications || []).filter((app) =>
                  applicantFilter === "all" ? true : app.status === applicantFilter
                );

                if (apps.length === 0) {
                  return (
                    <div className="py-12 text-center text-gray-400 font-mono text-sm">
                      No candidates found matching the "{applicantFilter}" filter.
                    </div>
                  );
                }

                return apps.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-xl bg-black/40 border border-gray-800 hover:border-teal-500/30 transition space-y-3 text-left"
                  >
                    {/* Top Row: Name, Academic, Status Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">{app.name}</h4>
                          <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                            Roll: {app.rollno}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {app.branch} • Year {app.year} • Applied{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>

                      {/* Status Selector & Delete */}
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateApplicantStatus(selectedPosition._id, app._id, e.target.value)
                          }
                          className={`p-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                            app.status === "accepted"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : app.status === "shortlisted"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                              : app.status === "rejected"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          <option value="pending" className="bg-[#0F1A24] text-white">
                            Pending
                          </option>
                          <option value="shortlisted" className="bg-[#0F1A24] text-white">
                            Shortlisted
                          </option>
                          <option value="accepted" className="bg-[#0F1A24] text-white">
                            Accepted
                          </option>
                          <option value="rejected" className="bg-[#0F1A24] text-white">
                            Rejected
                          </option>
                        </select>

                        <button
                          onClick={() =>
                            handleDeleteApplicant(selectedPosition._id, app._id, app.name)
                          }
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact & External Links */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      <a
                        href={`mailto:${app.email}`}
                        className="flex items-center gap-1 text-gray-300 hover:text-teal-400 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-teal-400" />
                        {app.email}
                      </a>

                      {app.phone && (
                        <a
                          href={`tel:${app.phone}`}
                          className="flex items-center gap-1 text-gray-300 hover:text-teal-400 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          {app.phone}
                        </a>
                      )}

                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Resume <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}

                      {app.githubUrl && (
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                        >
                          <Github className="w-3.5 h-3.5" />
                          GitHub
                        </a>
                      )}

                      {app.linkedinUrl && (
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          LinkedIn
                        </a>
                      )}

                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Portfolio
                        </a>
                      )}
                    </div>

                    {/* Why Join response */}
                    {app.whyJoin && (
                      <div className="bg-[#0F1A24] p-3 rounded-lg border border-gray-800/80 text-xs text-gray-300 leading-relaxed">
                        <strong className="text-teal-400 block font-mono mb-1">
                          Statement of Interest:
                        </strong>
                        <p className="whitespace-pre-line">{app.whyJoin}</p>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
