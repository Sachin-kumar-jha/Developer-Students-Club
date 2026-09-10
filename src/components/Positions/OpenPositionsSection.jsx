import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Briefcase,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Users,
  X,
  GraduationCap,
} from "lucide-react";
import ApplyModal from "./ApplyModal";
import AuthModal from "../AuthModal";

const DOMAINS = [
  "All",
  "Technical",
  "Design & Media",
  "Events & Management",
  "Content & Outreach",
  "PR & Sponsorship",
];

const YEAR_FILTERS = [
  { id: "All", label: "All Years" },
  { id: "1", label: "1st Year" },
  { id: "2", label: "2nd Year" },
  { id: "3", label: "3rd Year" },
  { id: "4", label: "4th Year" },
];

export default function OpenPositionsSection() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Authentication requirement states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingApplyPosition, setPendingApplyPosition] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/positions`);
      if (res.data?.data) {
        setPositions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load positions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // When student successfully signs in / logs in, proceed with pending apply
  useEffect(() => {
    if (user && pendingApplyPosition) {
      setSelectedPosition(pendingApplyPosition);
      setPendingApplyPosition(null);
    }
  }, [user, pendingApplyPosition]);

  const handleApplyClick = (pos) => {
    if (!user) {
      toast.info("Please sign in or create an account to apply for open positions.");
      setPendingApplyPosition(pos);
      setShowAuthModal(true);
      return;
    }
    setSelectedPosition(pos);
  };

  const filteredPositions = positions.filter((pos) => {
    const currentDomain = pos.domain || pos.department || "Technical";
    const matchesDomain =
      selectedDomain === "All" ||
      currentDomain.toLowerCase() === selectedDomain.toLowerCase();

    const matchesYear =
      selectedYearFilter === "All" ||
      !pos.eligibleYears ||
      pos.eligibleYears.length === 0 ||
      pos.eligibleYears.includes(Number(selectedYearFilter));

    const matchesSearch =
      pos.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.requirements?.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pos.responsibilities?.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDomain && matchesYear && matchesSearch;
  });

  const activeCount = positions.filter((p) => p.isOpen).length;

  return (
    <section id="positions" className="relative pt-0 pb-6 scroll-mt-16">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Section Header */}
        <div className="text-left space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Recruitment & Core Team
            </div>
            <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeCount} Active {activeCount === 1 ? "Role" : "Roles"}
              </span>
              <span>•</span>
              <span>{positions.length} Total</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            OPEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">POSITIONS</span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Ready to build, design, and lead with us? Explore open positions across our domains and
            submit your application.
          </p>
        </div>

        {/* Filter & Search Bar Container */}
        <div className="space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#162330]/80 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-teal-500/20 shadow-lg">
            {/* Domain Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-mono text-gray-400 uppercase mr-1 pl-1">Domain:</span>
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedDomain === domain
                      ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(20,184,166,0.35)] scale-102"
                      : "bg-black/40 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by role or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-black/50 border border-gray-800 rounded-xl text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Academic Year Eligibility Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-2 py-1 scrollbar-none">
            <span className="text-xs font-mono text-teal-400 uppercase mr-1 flex items-center gap-1.5 font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
              Year:
            </span>
            {YEAR_FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedYearFilter(id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  selectedYearFilter === id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "bg-black/40 text-gray-400 hover:text-gray-200 border border-gray-800/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Positions Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-gray-900/40 border border-gray-800 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-800 rounded" />
                  <div className="h-6 w-48 bg-gray-800 rounded" />
                </div>
                <div className="h-10 w-full bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredPositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPositions.map((pos) => {
              const isClosed = !pos.isOpen;
              const currentDomain = pos.domain || pos.department || "Technical";

              return (
                <motion.div
                  key={pos._id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className={`group relative flex flex-col justify-between bg-gradient-to-b from-[#162330]/90 via-[#0F1A24]/90 to-black/80 rounded-2xl p-5 sm:p-6 border transition-all duration-300 hover:-translate-y-1 text-left ${
                    isClosed
                      ? "border-gray-800/80 opacity-60"
                      : "border-teal-500/20 hover:border-teal-400/60 hover:shadow-[0_8px_30px_rgba(20,184,166,0.18)]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Domain & Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                        {currentDomain}
                      </span>
                      {isClosed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Closed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>

                    {/* Role Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition tracking-tight">
                      {pos.title}
                    </h3>

                    {/* Meta info: Role type & Deadline & WhatsApp & Eligible Years */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-400">
                      <span className="bg-black/50 px-2 py-0.5 rounded border border-gray-800 text-gray-300">
                        {pos.type || "Core Member"}
                      </span>
                      {pos.deadline && (
                        <div className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Due {new Date(pos.deadline).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {pos.whatsappLink && (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                        <GraduationCap className="w-3 h-3 text-cyan-400" />
                        <span>
                          {pos.eligibleYears && pos.eligibleYears.length > 0 && pos.eligibleYears.length < 4
                            ? `${pos.eligibleYears.slice().sort((a, b) => a - b).map((y) => `${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"}`).join(", ")} Year`
                            : "All Years"}
                        </span>
                      </span>
                    </div>

                    {/* Requirements / Responsibilities chips */}
                    {pos.requirements?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pos.requirements.slice(0, 3).map((req, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-black/40 border border-gray-800 text-[10px] font-mono text-gray-300"
                          >
                            {req}
                          </span>
                        ))}
                        {pos.requirements.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                            +{pos.requirements.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleApplyClick(pos)}
                      className="text-xs font-mono text-gray-400 hover:text-teal-400 transition flex items-center gap-1 cursor-pointer"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleApplyClick(pos)}
                      disabled={isClosed}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                        isClosed
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-black shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-102"
                      }`}
                    >
                      {user ? "Apply Now" : "Sign In to Apply"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#162330]/60 backdrop-blur-md border border-teal-500/20 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No Active Positions Found</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {searchQuery || selectedDomain !== "All"
                ? "No positions match your selected domain or search. Try another filter."
                : "Recruitment rounds open periodically during academic semesters. Check back soon!"}
            </p>
            {(searchQuery || selectedDomain !== "All") && (
              <button
                onClick={() => {
                  setSelectedDomain("All");
                  setSearchQuery("");
                }}
                className="px-4 py-1.5 bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/30 text-teal-400 rounded-xl text-xs font-mono font-semibold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Application / Details Modal */}
      {selectedPosition && (
        <ApplyModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
          onSuccess={() => fetchPositions()}
        />
      )}

      {/* Auth Prompt Modal if student clicks apply while logged out */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          defaultIsLogin={true}
        />
      )}
    </section>
  );
}
