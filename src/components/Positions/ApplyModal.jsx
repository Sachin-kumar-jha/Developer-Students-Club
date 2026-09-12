import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Check,
  UserCheck,
  Edit3,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

const ALL_ACADEMIC_YEARS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

export default function ApplyModal({ position, onClose, onSuccess }) {
  const { user } = useSelector((state) => state.auth);

  const hasRestrictedYears =
    Array.isArray(position?.eligibleYears) &&
    position.eligibleYears.length > 0 &&
    position.eligibleYears.length < 4;

  const availableYears = hasRestrictedYears
    ? ALL_ACADEMIC_YEARS.filter((item) => position.eligibleYears.includes(Number(item.value)))
    : ALL_ACADEMIC_YEARS;

  const getInitialYear = () => {
    if (hasRestrictedYears) {
      if (position.eligibleYears.length === 1) {
        return String(position.eligibleYears[0]);
      }
      if (user?.year && position.eligibleYears.includes(Number(user.year))) {
        return String(user.year);
      }
      return "";
    }
    return user?.year ? String(user.year) : "";
  };

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    rollno: user?.rollno || "",
    branch: user?.branch || "",
    year: getInitialYear(),
    phone: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    whyJoin: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // 'form' | 'details'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(position?.whatsappLink || "");
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);

  // Sync year whenever position changes
  useEffect(() => {
    if (hasRestrictedYears) {
      if (position.eligibleYears.length === 1) {
        setFormData((prev) => ({
          ...prev,
          year: String(position.eligibleYears[0]),
        }));
      } else {
        setFormData((prev) => {
          if (prev.year && !position.eligibleYears.includes(Number(prev.year))) {
            return { ...prev, year: "" };
          }
          return prev;
        });
      }
    }
  }, [position]);

  // Auto-fetch fresh profile details if missing in redux state
  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (user && (!user.rollno || !user.branch || !user.year)) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            withCredentials: true,
          });
          const u = res.data?.user;
          if (u) {
            setFormData((prev) => {
              let yearVal = prev.year;
              if (!yearVal) {
                if (hasRestrictedYears) {
                  if (position.eligibleYears.length === 1) {
                    yearVal = String(position.eligibleYears[0]);
                  } else if (u.year && position.eligibleYears.includes(Number(u.year))) {
                    yearVal = String(u.year);
                  }
                } else if (u.year) {
                  yearVal = String(u.year);
                }
              }
              return {
                ...prev,
                name: prev.name || u.name || "",
                email: prev.email || u.email || "",
                rollno: prev.rollno || u.rollno || "",
                branch: prev.branch || u.branch || "",
                year: yearVal || (hasRestrictedYears && position.eligibleYears.length === 1 ? String(position.eligibleYears[0]) : ""),
              };
            });
          }
        } catch (err) {
          // quiet fallback
        }
      }
    };

    fetchFreshProfile();
  }, [user, position]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.rollno || !formData.branch || !formData.year) {
      toast.error("Please fill all required academic details");
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      toast.error("Please enter your WhatsApp / phone number");
      return;
    }

    if (!formData.linkedinUrl || !formData.linkedinUrl.trim()) {
      toast.error("Please enter your LinkedIn / portfolio URL");
      return;
    }

    // Validate Academic Year Eligibility
    if (position.eligibleYears && position.eligibleYears.length > 0 && position.eligibleYears.length < 4) {
      const studentYear = Number(formData.year);
      if (!position.eligibleYears.includes(studentYear)) {
        const labels = position.eligibleYears
          .slice()
          .sort((a, b) => a - b)
          .map((y) => `${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"} Year`)
          .join(", ");
        toast.error(`This position is only open for ${labels}. Your selected year is Year ${studentYear}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/positions/${position._id}/apply`,
        formData,
        { withCredentials: true }
      );

      toast.success(res.data?.message || "Application submitted successfully!");
      if (res.data?.whatsappLink) {
        setWhatsappLink(res.data.whatsappLink);
      }
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!position) return null;

  const currentDomain = position.domain || position.department || "Technical";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#0F1A24] border border-teal-500/30 rounded-2xl shadow-[0_0_50px_rgba(20,184,166,0.15)] overflow-hidden my-8"
        >
          {/* Top Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

          {/* Modal Header */}
          <div className="p-6 border-b border-gray-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  Domain: {currentDomain}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-gray-800 text-gray-300 border border-gray-700">
                  {position.type || "Core Member"}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {position.eligibleYears && position.eligibleYears.length > 0 && position.eligibleYears.length < 4
                    ? `${position.eligibleYears.slice().sort((a, b) => a - b).map((y) => `${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"}`).join(", ")} Year Only`
                    : "All Years"}
                </span>
                {position.isOpen ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Open
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Closed
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {position.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If Submitted: Show WhatsApp Link & Success Screen */}
          {isSubmitted ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Application Submitted! 🎉
                </h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for applying for <strong>{position.title}</strong>. Your details have been
                  registered under your account.
                </p>
              </div>

              {/* WhatsApp Box */}
              {whatsappLink ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black/60 to-[#0F1A24] border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] max-w-lg mx-auto space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Join the WhatsApp Group</h4>
                      <p className="text-xs text-gray-400 font-mono">
                        Official updates, shortlist announcements & interview schedules
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Important: Please join the WhatsApp group below so you don't miss notifications
                    regarding your interview and task rounds.
                  </p>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-black" />
                    Join WhatsApp Group Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs font-mono text-gray-400 max-w-md mx-auto">
                  Our core team will review your application and contact you via email or phone.
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs: Form vs Role Requirements */}
              <div className="flex border-b border-gray-800 bg-[#0F1A24]/60 px-6">
                <button
                  onClick={() => setActiveTab("form")}
                  className={`py-3 px-4 text-sm font-mono font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "form"
                      ? "border-teal-400 text-teal-400"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Application Form
                </button>
                {(position.requirements?.length > 0 || position.responsibilities?.length > 0) && (
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-3 px-4 text-sm font-mono font-bold tracking-wider transition-colors border-b-2 cursor-pointer ${
                      activeTab === "details"
                        ? "border-teal-400 text-teal-400"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Requirements & Role
                  </button>
                )}
              </div>

              {/* Form Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-left">
                {activeTab === "details" ? (
                  <div className="space-y-6">
                    {position.responsibilities?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono text-teal-400 uppercase tracking-wider mb-2">
                          Responsibilities
                        </h3>
                        <ul className="space-y-2">
                          {position.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {position.requirements?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono text-teal-400 uppercase tracking-wider mb-2">
                          Requirements & Skills
                        </h3>
                        <ul className="space-y-2">
                          {position.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab("form")}
                      className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-black font-bold font-mono uppercase tracking-wider rounded-xl transition text-sm cursor-pointer"
                    >
                      Fill Application Form
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Position info banner */}
                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-xs text-teal-300 font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span>
                          Applying for: <strong>{position.title}</strong> (Domain: {currentDomain})
                        </span>
                      </div>
                      {position.deadline && (
                        <span className="text-amber-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(position.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>

                    {/* Verified Signed-in Student Profile Card */}
                    <div className="bg-gradient-to-r from-[#162330] to-black/60 border border-teal-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-400/20 border border-teal-400/40 flex items-center justify-center font-bold text-teal-300 font-mono">
                          {formData.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{formData.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Auto-Fetched Profile
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {formData.rollno ? `Roll: ${formData.rollno} • ` : ""}
                            {formData.branch ? `${formData.branch} • ` : ""}
                            {formData.year ? `Year ${formData.year} • ` : ""}
                            {formData.email}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingAcademic(!isEditingAcademic)}
                        className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer self-end sm:self-center"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isEditingAcademic ? "Hide Details" : "Edit Profile Info"}
                      </button>
                    </div>

                    {/* Academic details (shown if user wants to edit or if any field missing) */}
                    {(isEditingAcademic || !formData.rollno || !formData.branch || !formData.year) && (
                      <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3">
                        <p className="text-[11px] font-mono text-teal-400 uppercase">
                          Academic & Contact Verification
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-mono uppercase">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="p-2.5 rounded-lg bg-black/60 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-mono uppercase">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="p-2.5 rounded-lg bg-black/60 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-mono uppercase">Roll Number</label>
                            <input
                              type="text"
                              name="rollno"
                              value={formData.rollno}
                              onChange={handleChange}
                              placeholder="e.g. 23112"
                              required
                              className="p-2.5 rounded-lg bg-black/60 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-mono uppercase">Branch</label>
                            <input
                              type="text"
                              name="branch"
                              value={formData.branch}
                              onChange={handleChange}
                              placeholder="e.g. Computer Science / IT"
                              required
                              className="p-2.5 rounded-lg bg-black/60 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-mono uppercase">Academic Year</label>
                            <select
                              name="year"
                              value={formData.year}
                              onChange={handleChange}
                              required
                              className="p-2.5 rounded-lg bg-black/60 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                            >
                              {availableYears.length > 1 && <option value="">Select Year</option>}
                              {availableYears.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Year Eligibility Notice if restricted */}
                    {hasRestrictedYears && (
                      ((user?.year && !position.eligibleYears.includes(Number(user.year))) ||
                        (formData.year && !position.eligibleYears.includes(Number(formData.year)))) && (
                        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5 shadow-sm">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                          <div>
                            <strong className="text-amber-200">Year Eligibility Notice:</strong> This position is specifically open for{" "}
                            <span className="text-white font-bold">
                              {position.eligibleYears
                                .slice()
                                .sort((a, b) => a - b)
                                .map((y) => `${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"}`)
                                .join(", ")}{" "}
                              Year
                            </span>{" "}
                            students only.
                          </div>
                        </div>
                      )
                    )}

                    {/* Candidate links & specific fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400 font-mono uppercase">
                          WhatsApp / Phone Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400 font-mono uppercase flex items-center justify-between">
                          <span>GitHub Profile URL</span>
                          <span className="text-gray-500 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                          type="url"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                          className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                        />
                      </div>

                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-gray-400 font-mono uppercase">
                          LinkedIn / Portfolio URL <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          required
                          value={formData.linkedinUrl}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username or personal portfolio link"
                          className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <label className="text-xs text-gray-400 font-mono uppercase">
                        Why do you want to join DSC for this role?
                      </label>
                      <textarea
                        name="whyJoin"
                        rows={3}
                        value={formData.whyJoin}
                        onChange={handleChange}
                        placeholder="Tell us about your interests, past projects, or why you'd be a great contributor..."
                        className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-mono transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
