import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventCertificates,
  generateBulkCertificates,
  issueSingleCertificate,
  uploadCertificateTemplate,
  deleteCertificate,
  updateCertificateStatus,
  fetchEventCandidates,
} from "../../redux/slices/certificateSlice.js";
import { fetchEvents } from "../../redux/slices/eventSlice.js";
import {
  renderCertificateToCanvas,
  resolveTemplateConfig,
  downloadCertificatePNG,
  downloadCertificatePDF,
  getVerificationUrl,
} from "../../utils/certificateRenderer.js";
import {
  Award,
  Upload,
  Sparkles,
  Users,
  Search,
  Download,
  Eye,
  ExternalLink,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Settings,
  X,
  RefreshCw,
  QrCode,
  ShieldCheck,
  UserPlus,
  Move,
  Crosshair,
  Type,
  Sliders,
  Palette,
  UserCheck,
  UserX,
  Check,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageCertificates() {
  const dispatch = useDispatch();

  const events = useSelector((state) => state.events.events || []);
  const {
    eventCertificates,
    candidates,
    loadingCandidates,
    eventData,
    stats,
    loading,
    generating,
    uploadingTemplate,
  } = useSelector((state) => state.certificates);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("certificates"); // "certificates" | "candidates"
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("all"); // "all" | "attended" | "not_attended" | "pending"
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Modals state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCertForPreview, setSelectedCertForPreview] = useState(null);
  const [showSingleIssueModal, setShowSingleIssueModal] = useState(false);
  const [showConfirmBulkModal, setShowConfirmBulkModal] = useState(false);
  const [bulkTarget, setBulkTarget] = useState("attended");

  // Template Form State
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState("");
  const [placementTool, setPlacementTool] = useState("none"); // "none" | "name" | "qr"
  const [templateForm, setTemplateForm] = useState({
    title: "Certificate of Participation",
    subtitle: "This is proudly presented to",
    bodyText:
      "for successfully participating in the hands-on workshop on Git & GitHub during Git Connect organized by Developer Student Club.",
    signatory1Name: "Sachin Sharma",
    signatory1Role: "Club Lead, DSC",
    signatory2Name: "Dr. Dinesh Birla",
    signatory2Role: "Faculty Advisor, DSC",
    qrPosition: "bottom-center",
    issueDate: new Date().toISOString().split("T")[0],
    // Precise Position & Dimension Controls
    nameX: 50,
    nameY: 47,
    nameFontSize: 54,
    nameColor: "#000000",
    showRollNo: false,
    qrX: 50,
    qrY: 88,
    qrSize: 140,
    transparentQr: true,
    sampleName: "ANUSHKA",
  });

  // Single Issue Form State
  const [singleForm, setSingleForm] = useState({
    recipientName: "",
    recipientRollNo: "",
    recipientBranch: "",
    recipientEmail: "",
    userId: "",
    certificateType: "participation",
  });

  const previewCanvasRef = useRef(null);
  const templateStudioCanvasRef = useRef(null);

  // Fetch events on mount
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Default to Git Connect event if available, otherwise first event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const gitEvent = events.find((e) =>
        e.title?.toLowerCase().includes("git")
      );
      if (gitEvent) {
        setSelectedEventId(gitEvent._id);
      } else {
        setSelectedEventId(events[0]._id);
      }
    }
  }, [events, selectedEventId]);

  // Fetch certificates and candidates when selected event or filters change
  useEffect(() => {
    if (selectedEventId) {
      dispatch(
        fetchEventCertificates({
          eventId: selectedEventId,
          search: searchQuery,
          status: statusFilter,
        })
      );
      dispatch(
        fetchEventCandidates({
          eventId: selectedEventId,
          search: candidateSearch,
        })
      );
    }
  }, [selectedEventId, searchQuery, statusFilter, candidateSearch, dispatch]);

  // Sync template form values when eventData loads
  useEffect(() => {
    if (eventData?.certificateTemplate) {
      const ct = eventData.certificateTemplate;
      setTemplateForm((prev) => ({
        ...prev,
        title: ct.title || "Certificate of Participation",
        subtitle: ct.subtitle || "This is proudly presented to",
        bodyText:
          ct.bodyText ||
          "for successfully participating in the hands-on workshop on Git & GitHub during Git Connect organized by Developer Student Club.",
        signatory1Name: ct.signatory1Name || "Sachin Sharma",
        signatory1Role: ct.signatory1Role || "Club Lead, DSC",
        signatory2Name: ct.signatory2Name || "Dr. Dinesh Birla",
        signatory2Role: ct.signatory2Role || "Faculty Advisor, DSC",
        qrPosition: ct.qrPosition || "bottom-center",
        issueDate: ct.issueDate ? ct.issueDate.split("T")[0] : new Date().toISOString().split("T")[0],
        nameX: ct.nameX !== undefined ? ct.nameX : 50,
        nameY: ct.nameY !== undefined ? ct.nameY : 47,
        nameFontSize: ct.nameFontSize || 54,
        nameColor: ct.nameColor || "#000000",
        showRollNo: Boolean(ct.showRollNo),
        qrX: ct.qrX !== undefined ? ct.qrX : 50,
        qrY: ct.qrY !== undefined ? ct.qrY : 88,
        qrSize: ct.qrSize || 140,
        transparentQr: ct.transparentQr !== undefined ? ct.transparentQr : true,
      }));
      if (ct.imageUrl) {
        setTemplatePreviewUrl(ct.imageUrl);
      }
    }
  }, [eventData]);

  // Real-time canvas render for Template Studio Modal
  useEffect(() => {
    if (showTemplateModal && templateStudioCanvasRef.current) {
      const timer = setTimeout(async () => {
        try {
          if (templateStudioCanvasRef.current) {
            await renderCertificateToCanvas(
              templateStudioCanvasRef.current,
              {
                certificateId: "DSC-GC-2026-DEMO",
                recipientName: templateForm.sampleName || "ANUSHKA",
                recipientRollNo: "26DBT0634",
                recipientBranch: "CSE",
                issueDate: templateForm.issueDate || new Date().toISOString(),
                eventTitle: eventData?.title || "Git Connect",
              },
              {
                imageUrl: templatePreviewUrl,
                nameX: templateForm.nameX,
                nameY: templateForm.nameY,
                nameFontSize: templateForm.nameFontSize,
                nameColor: templateForm.nameColor,
                showRollNo: templateForm.showRollNo,
                qrX: templateForm.qrX,
                qrY: templateForm.qrY,
                qrSize: templateForm.qrSize,
                transparentQr: templateForm.transparentQr,
                qrPosition: templateForm.qrPosition,
              }
            );
          }
        } catch (err) {
          console.error("Template studio canvas render error:", err);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [
    showTemplateModal,
    templateForm.nameX,
    templateForm.nameY,
    templateForm.nameFontSize,
    templateForm.nameColor,
    templateForm.showRollNo,
    templateForm.qrX,
    templateForm.qrY,
    templateForm.qrSize,
    templateForm.transparentQr,
    templateForm.sampleName,
    templatePreviewUrl,
    eventData,
  ]);

  // Visual click-to-position on canvas preview
  const handleCanvasClick = (e) => {
    if (placementTool === "none" || !templateStudioCanvasRef.current) return;
    const canvas = templateStudioCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const roundedX = Math.round(clickX * 10) / 10;
    const roundedY = Math.round(clickY * 10) / 10;

    if (placementTool === "name") {
      setTemplateForm((prev) => ({ ...prev, nameX: roundedX, nameY: roundedY }));
      toast.info(`Name position set to X: ${roundedX}%, Y: ${roundedY}%`);
    } else if (placementTool === "qr") {
      setTemplateForm((prev) => ({ ...prev, qrX: roundedX, qrY: roundedY }));
      toast.info(`QR Code position set to X: ${roundedX}%, Y: ${roundedY}%`);
    }
  };

  // Render canvas whenever preview modal is opened with a certificate
  useEffect(() => {
    if (showPreviewModal && selectedCertForPreview && previewCanvasRef.current) {
      setTimeout(async () => {
        try {
          const tConfig = resolveTemplateConfig(
            selectedCertForPreview,
            {},
            eventData?.certificateTemplate
          );
          await renderCertificateToCanvas(
            previewCanvasRef.current,
            selectedCertForPreview,
            tConfig
          );
        } catch (err) {
          console.error("Preview canvas rendering error:", err);
        }
      }, 100);
    }
  }, [showPreviewModal, selectedCertForPreview, eventData]);

  // Handle template file selection
  const handleTemplateFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      setTemplatePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    const formData = new FormData();
    if (templateFile) {
      formData.append("template", templateFile);
    }
    Object.keys(templateForm).forEach((key) => {
      formData.append(key, templateForm[key]);
    });

    const res = await dispatch(
      uploadCertificateTemplate({ eventId: selectedEventId, formData })
    );

    if (uploadCertificateTemplate.fulfilled.match(res)) {
      toast.success("Certificate template updated successfully!");
      setShowTemplateModal(false);
      dispatch(fetchEventCertificates({ eventId: selectedEventId }));
    } else {
      toast.error(res.payload || "Failed to update template");
    }
  };

  // Bulk generate certificates
  const handleBulkGenerate = async () => {
    if (!selectedEventId) return;

    const res = await dispatch(
      generateBulkCertificates({
        eventId: selectedEventId,
        target: bulkTarget,
      })
    );

    setShowConfirmBulkModal(false);

    if (generateBulkCertificates.fulfilled.match(res)) {
      toast.success(
        res.payload?.message || "Certificates generated successfully!"
      );
      dispatch(fetchEventCertificates({ eventId: selectedEventId }));
    } else {
      toast.error(res.payload || "Failed to generate certificates");
    }
  };

  // Issue single certificate (Admin override for any individual)
  const handleIssueSingle = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEventId) return;

    if (!singleForm.recipientName?.trim()) {
      toast.error("Student Name is required");
      return;
    }

    const res = await dispatch(
      issueSingleCertificate({
        ...singleForm,
        eventId: selectedEventId,
      })
    );

    if (issueSingleCertificate.fulfilled.match(res)) {
      toast.success(res.payload?.message || "Certificate issued successfully!");
      setShowSingleIssueModal(false);
      setSingleForm({
        recipientName: "",
        recipientRollNo: "",
        recipientBranch: "",
        recipientEmail: "",
        userId: "",
        certificateType: "participation",
        customNotes: "",
      });
      setStudentSearchQuery("");
      dispatch(fetchEventCertificates({ eventId: selectedEventId }));
      dispatch(fetchEventCandidates({ eventId: selectedEventId }));
    } else {
      toast.error(res.payload || "Failed to issue certificate");
    }
  };

  // Quick issue for candidate from directory (whether attended or not)
  const handleQuickIssue = (cand) => {
    setSingleForm({
      recipientName: cand.name,
      recipientRollNo: cand.rollno || "N/A",
      recipientBranch: cand.branch || "",
      recipientEmail: cand.email || "",
      userId: cand.userId || "",
      certificateType: "participation",
      customNotes: cand.attendedBothDays
        ? "Issued via complete event attendance (22 & 23 Oct)"
        : cand.daysAttendedCount > 0
        ? "Issued via 1-day attendance (Admin approval)"
        : "Manually issued by Administrator (Attendance override)",
    });
    setShowSingleIssueModal(true);
  };

  // Delete certificate
  const handleDeleteCert = async (certId) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete certificate ${certId}?`
      )
    )
      return;

    const res = await dispatch(deleteCertificate(certId));
    if (deleteCertificate.fulfilled.match(res)) {
      toast.success(`Certificate ${certId} deleted`);
    } else {
      toast.error(res.payload || "Failed to delete certificate");
    }
  };

  // Toggle status (Active / Revoked)
  const handleToggleStatus = async (cert) => {
    const newStatus = cert.status === "active" ? "revoked" : "active";
    const res = await dispatch(
      updateCertificateStatus({
        certificateId: cert.certificateId,
        status: newStatus,
      })
    );

    if (updateCertificateStatus.fulfilled.match(res)) {
      toast.success(`Certificate ${cert.certificateId} marked as ${newStatus}`);
      dispatch(fetchEventCertificates({ eventId: selectedEventId }));
    } else {
      toast.error(res.payload || "Failed to update status");
    }
  };

  // Copy verification link
  const handleCopyLink = (certId) => {
    const url = getVerificationUrl(certId);
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied to clipboard!");
  };

  // Download PDF directly for a certificate
  const handleDownloadSinglePDF = async (cert) => {
    try {
      const tempCanvas = document.createElement("canvas");
      const tConfig = resolveTemplateConfig(
        cert,
        {},
        eventData?.certificateTemplate
      );
      await renderCertificateToCanvas(tempCanvas, cert, tConfig);
      const filename = `${cert.recipientName.replace(/\s+/g, "_")}_${
        cert.certificateId
      }.pdf`;
      downloadCertificatePDF(tempCanvas, filename, cert);
      toast.success("Certificate PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="space-y-8">
      {/* Top Banner / Event Selector */}
      <div className="bg-gradient-to-r from-[#0F1A24]/90 via-black/80 to-[#0F1A24]/90 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-mono rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                Certificate Distribution Hub
              </span>
              <span className="text-gray-500 text-xs font-mono">• Anti-Tamper QR Authenticated</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Manage & Issue Event Certificates
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Distribute authentic certificates with dynamic verification QR codes. Anyone scanning the QR code with any smartphone camera instantly verifies authenticity on this website.
            </p>
          </div>

          {/* Event Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Select Event:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-black/60 border border-teal-500/40 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400 font-semibold cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id} className="bg-slate-900 text-white">
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:self-end">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Customize Template
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div className="bg-black/40 border border-teal-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                {stats?.attendedBothDaysCount !== undefined ? stats.attendedBothDaysCount : (stats?.attendedCount || 0)}
              </div>
              <div className="text-teal-400 text-xs font-bold">Both Days Attendees (22 & 23 Oct)</div>
              <div className="text-gray-400 text-[10px] font-mono">Eligible by default</div>
            </div>
          </div>

          <div className="bg-black/40 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {stats?.attendedSingleDayCount || 0}
              </div>
              <div className="text-amber-400 text-xs font-bold">1 Day Attendees Only</div>
              <div className="text-gray-500 text-[10px] font-mono">Excluded from auto-issue</div>
            </div>
          </div>

          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                {stats?.registeredCount || 0}
              </div>
              <div className="text-gray-400 text-xs font-bold">Total Registrations</div>
              <div className="text-gray-500 text-[10px] font-mono">{stats?.totalAttendeesAnyDay || 0} came on any day</div>
            </div>
          </div>

          <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {eventCertificates.length}
              </div>
              <div className="text-gray-400 text-xs font-bold">Certificates Issued</div>
              <div className="text-emerald-400/80 text-[10px] font-mono">100% Authentic Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generation & Actions Bar */}
      <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setBulkTarget("attended");
              setShowConfirmBulkModal(true);
            }}
            disabled={generating}
            className="px-5 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-black rounded-xl text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating
              ? "Generating..."
              : `Issue to Both Days Attendees (${stats?.attendedBothDaysCount !== undefined ? stats.attendedBothDaysCount : (stats?.attendedCount || 0)})`}
          </button>

          <button
            onClick={() => {
              setBulkTarget("all_registered");
              setShowConfirmBulkModal(true);
            }}
            disabled={generating}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            Issue to All Registered ({stats?.registeredCount || 0})
          </button>

          <button
            onClick={() => setShowSingleIssueModal(true)}
            className="px-4 py-3 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/10"
          >
            <UserPlus className="w-4 h-4 text-purple-400" />
            Issue Individual (Override)
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-400"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Certificates List / Table */}
      <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Tab Switcher & Status Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              Issued Certificates ({eventCertificates.length})
            </button>

            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
                activeTab === "candidates"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              All Students & Attendance Directory ({candidates.length || stats?.registeredCount || 0})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {eventData?.certificateTemplate?.imageUrl ? (
              <span className="text-xs px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-teal-400" />
                Custom Background Active
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-gray-400 font-mono">
                Using DSC Standard Luxury Template
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: ISSUED CERTIFICATES */}
        {activeTab === "certificates" && (
          <>
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm font-mono">Loading certificates...</p>
              </div>
            ) : eventCertificates.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-teal-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">No Certificates Generated Yet</h4>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                  Click &quot;Issue Certificates to Attendees&quot; above to automatically generate authentic certificates, or switch to the Candidates tab to issue to any individual student.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-gray-400 font-mono text-xs uppercase border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Roll No / Branch</th>
                      <th className="px-6 py-4">Certificate ID</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {eventCertificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-teal-500/5 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{cert.recipientName}</div>
                          <div className="text-gray-500 text-xs font-mono">{cert.recipientEmail}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-white font-mono text-xs">{cert.recipientRollNo}</div>
                          <div className="text-gray-400 text-xs">{cert.recipientBranch || "DSC"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/40 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold">
                            <QrCode className="w-3.5 h-3.5 text-teal-400" />
                            {cert.certificateId}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-300 text-xs">
                          {new Date(cert.issueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(cert)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold transition cursor-pointer ${
                              cert.status === "active"
                                ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                                : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                            }`}
                          >
                            {cert.status === "active" ? "Active" : "Revoked"}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => {
                                setSelectedCertForPreview(cert);
                                setShowPreviewModal(true);
                              }}
                              className="p-1.5 hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 rounded-lg transition"
                              title="Preview Certificate"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Download PDF */}
                            <button
                              onClick={() => handleDownloadSinglePDF(cert)}
                              className="p-1.5 hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 rounded-lg transition"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(cert.certificateId)}
                              className="p-1.5 hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 rounded-lg transition"
                              title="Copy Verification Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Open Public Verification Page */}
                            <a
                              href={getVerificationUrl(cert.certificateId)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 rounded-lg transition"
                              title="Open Verification Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteCert(cert.certificateId)}
                              className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition"
                              title="Delete Certificate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* TAB 2: ALL CANDIDATES & ATTENDANCE DIRECTORY */}
        {activeTab === "candidates" && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Filter Pills & Candidate Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-gray-800">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-gray-400 mr-1">Filter:</span>
                <button
                  onClick={() => setCandidateFilter("all")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    candidateFilter === "all"
                      ? "bg-purple-500 text-white font-bold"
                      : "bg-black/40 text-gray-400 hover:text-white"
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setCandidateFilter("both_days")}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    candidateFilter === "both_days"
                      ? "bg-green-500/20 border border-green-500/50 text-green-300 font-bold"
                      : "bg-black/40 text-gray-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-green-400" />
                  Both Days ({candidates.filter((c) => c.attendedBothDays).length})
                </button>
                <button
                  onClick={() => setCandidateFilter("single_day")}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    candidateFilter === "single_day"
                      ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold"
                      : "bg-black/40 text-gray-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  1 Day Only ({candidates.filter((c) => !c.attendedBothDays && c.daysAttendedCount > 0).length})
                </button>
                <button
                  onClick={() => setCandidateFilter("not_attended")}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    candidateFilter === "not_attended"
                      ? "bg-red-500/20 border border-red-500/50 text-red-300 font-bold"
                      : "bg-black/40 text-gray-400 hover:text-white"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5 text-red-400" />
                  Did Not Attend ({candidates.filter((c) => !c.daysAttendedCount).length})
                </button>
                <button
                  onClick={() => setCandidateFilter("pending")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    candidateFilter === "pending"
                      ? "bg-teal-500/20 border border-teal-500/50 text-teal-300 font-bold"
                      : "bg-black/40 text-gray-400 hover:text-white"
                  }`}
                >
                  Pending Certificate ({candidates.filter((c) => !c.hasCertificate).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-gray-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Candidates Table */}
            {loadingCandidates ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm font-mono">Loading students directory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-gray-400 font-mono text-xs uppercase border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Roll No / Branch</th>
                      <th className="px-6 py-4">Attendance Status</th>
                      <th className="px-6 py-4">Certificate Status</th>
                      <th className="px-6 py-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {candidates
                      .filter((c) => {
                        if (candidateFilter === "both_days" || candidateFilter === "attended") return c.attendedBothDays;
                        if (candidateFilter === "single_day") return !c.attendedBothDays && c.daysAttendedCount > 0;
                        if (candidateFilter === "not_attended") return !c.daysAttendedCount;
                        if (candidateFilter === "pending") return !c.hasCertificate;
                        return true;
                      })
                      .map((cand) => (
                        <tr key={cand.userId} className="hover:bg-purple-500/5 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{cand.name}</div>
                            <div className="text-gray-500 text-xs font-mono">{cand.email}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-white font-mono text-xs">{cand.rollno}</div>
                            <div className="text-gray-400 text-xs">{cand.branch || "General"}</div>
                          </td>

                          <td className="px-6 py-4">
                            {cand.attendedBothDays ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                                <UserCheck className="w-3.5 h-3.5" />
                                Both Days (22 & 23 Oct)
                              </span>
                            ) : cand.daysAttendedCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <Clock className="w-3.5 h-3.5" />
                                1 Day ({cand.attendedDates?.[0] ? cand.attendedDates[0].replace(/.*-/, '') + ' Oct' : '1 Day'})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                                <UserX className="w-3.5 h-3.5" />
                                Did Not Attend
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {cand.hasCertificate ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/40 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold">
                                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                                {cand.certificateId}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 font-mono italic">
                                Not Issued Yet
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {cand.hasCertificate ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={getVerificationUrl(cand.certificateId)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 rounded-lg transition"
                                  title="View Public Certificate"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleQuickIssue(cand)}
                                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-mono transition cursor-pointer"
                                >
                                  Re-Issue
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickIssue(cand)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold rounded-lg text-xs transition flex items-center gap-1.5 ml-auto shadow-md shadow-teal-500/20 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Issue Certificate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Customization & Layout Studio Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A121A] border border-gray-700/80 rounded-2xl w-full max-w-6xl shadow-2xl relative max-h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0F1A24]">
              <div>
                <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Certificate Template & Layout Studio
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Customize background, exact coordinates for Student Name & QR Code, and preview in real-time.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Body */}
            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Live Canvas Preview & Click Placement (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 p-2.5 rounded-xl border border-gray-800">
                    <span className="text-xs font-mono text-gray-300 font-bold flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4 text-teal-400" />
                      Interactive Placement:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setPlacementTool("none")}
                        className={`px-2.5 py-1 rounded-lg font-mono transition ${
                          placementTool === "none"
                            ? "bg-gray-700 text-white font-bold"
                            : "bg-black/40 text-gray-400 hover:text-white"
                        }`}
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacementTool("name")}
                        className={`px-2.5 py-1 rounded-lg font-mono transition flex items-center gap-1 ${
                          placementTool === "name"
                            ? "bg-teal-500 text-black font-bold shadow-lg shadow-teal-500/20"
                            : "bg-black/40 text-teal-400 border border-teal-500/30 hover:bg-teal-500/10"
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        Click to Place Name
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacementTool("qr")}
                        className={`px-2.5 py-1 rounded-lg font-mono transition flex items-center gap-1 ${
                          placementTool === "qr"
                            ? "bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20"
                            : "bg-black/40 text-purple-400 border border-purple-500/30 hover:bg-purple-500/10"
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Click to Place QR
                      </button>
                    </div>
                  </div>

                  {/* Click tooltip banner */}
                  {placementTool !== "none" && (
                    <div className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center justify-between">
                      <span>
                        🎯 Click anywhere on the certificate canvas below to move{" "}
                        <strong className="uppercase font-bold text-white">
                          {placementTool === "name" ? "Student Name" : "QR Code"}
                        </strong>{" "}
                        to that exact location.
                      </span>
                      <button
                        type="button"
                        onClick={() => setPlacementTool("none")}
                        className="text-xs text-gray-400 hover:text-white underline ml-2"
                      >
                        Done
                      </button>
                    </div>
                  )}

                  {/* Live Canvas Preview Frame */}
                  <div className="relative border-2 border-gray-800 rounded-xl overflow-hidden shadow-2xl bg-black/60 group">
                    <canvas
                      ref={templateStudioCanvasRef}
                      onClick={handleCanvasClick}
                      className={`w-full h-auto block select-none ${
                        placementTool !== "none" ? "cursor-crosshair" : "cursor-default"
                      }`}
                    />
                  </div>

                  {/* Coordinates Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-black/30 border border-gray-800/80 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-teal-400">
                        Name: X={templateForm.nameX}%, Y={templateForm.nameY}% ({templateForm.nameFontSize}px)
                      </span>
                      <span className="text-purple-400">
                        QR: X={templateForm.qrX}%, Y={templateForm.qrY}% ({templateForm.qrSize}px)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span>Presets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            nameX: 50,
                            nameY: 47,
                            qrX: 50,
                            qrY: 88,
                            qrSize: 140,
                            transparentQr: true,
                          }))
                        }
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-teal-500/20 hover:text-teal-300 text-gray-300 transition"
                      >
                        Bottom Center
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            qrX: 85,
                            qrY: 85,
                            qrSize: 140,
                            transparentQr: true,
                          }))
                        }
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-teal-500/20 hover:text-teal-300 text-gray-300 transition"
                      >
                        Bottom Right
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Precise Sliders & Inputs (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* SECTION 1: Background Template */}
                  <div className="p-4 rounded-xl bg-[#0F1A24] border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-teal-400" />
                        1. Background Template Image
                      </label>
                      {templatePreviewUrl && (
                        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="border border-dashed border-gray-700 hover:border-teal-500/50 rounded-lg p-3 text-center cursor-pointer relative bg-black/30 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTemplateFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-xs text-gray-300">
                        <Upload className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                        <span className="font-semibold text-white">Click to upload template image</span>
                        <p className="text-gray-500 text-[10px] mt-0.5">PNG / JPG / WEBP (2000 x 1414 landscape)</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Student Name Placement & Dimensions */}
                  <div className="p-4 rounded-xl bg-[#0F1A24] border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <label className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1.5">
                        <Type className="w-4 h-4" />
                        2. Student Name Options (Only Name)
                      </label>
                      <button
                        type="button"
                        onClick={() => setPlacementTool("name")}
                        className="text-[11px] font-mono text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <Crosshair className="w-3 h-3" />
                        Set by Click
                      </button>
                    </div>

                    {/* Sample Name */}
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        Sample Name for Preview
                      </label>
                      <input
                        type="text"
                        value={templateForm.sampleName}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, sampleName: e.target.value })
                        }
                        placeholder="e.g. ANUSHKA"
                        className="w-full p-2 bg-black/50 border border-gray-700 rounded-lg text-white font-mono text-xs uppercase"
                      />
                    </div>

                    {/* Name Horizontal X Position */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>Horizontal Position (X %)</span>
                        <span className="text-teal-400 font-bold">{templateForm.nameX}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={templateForm.nameX}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, nameX: Number(e.target.value) })
                          }
                          className="flex-1 accent-teal-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={templateForm.nameX}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, nameX: Number(e.target.value) })
                          }
                          className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-center text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* Name Vertical Y Position */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>Vertical Position (Y %)</span>
                        <span className="text-teal-400 font-bold">{templateForm.nameY}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={templateForm.nameY}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, nameY: Number(e.target.value) })
                          }
                          className="flex-1 accent-teal-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={templateForm.nameY}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, nameY: Number(e.target.value) })
                          }
                          className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-center text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* Font Size & Color */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                          <span>Font Size</span>
                          <span className="text-teal-400 font-bold">{templateForm.nameFontSize}px</span>
                        </div>
                        <input
                          type="number"
                          min="20"
                          max="120"
                          value={templateForm.nameFontSize}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, nameFontSize: Number(e.target.value) })
                          }
                          className="w-full p-1.5 bg-black/50 border border-gray-700 rounded-lg text-center text-xs font-mono text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1">
                          Font Color (Black)
                        </label>
                        <div className="flex items-center gap-2 bg-black/50 border border-gray-700 rounded-lg p-1">
                          <input
                            type="color"
                            value={templateForm.nameColor}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, nameColor: e.target.value })
                            }
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-xs font-mono text-white font-bold">{templateForm.nameColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Omit Roll No / Branch Checkbox */}
                    <div className="pt-2 border-t border-gray-800/80">
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={templateForm.showRollNo}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, showRollNo: e.target.checked })
                          }
                          className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
                        />
                        <span>Print Roll No & Branch below name (Keep unchecked to omit)</span>
                      </label>
                    </div>
                  </div>

                  {/* SECTION 3: QR Code Placement & Dimensions */}
                  <div className="p-4 rounded-xl bg-[#0F1A24] border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <label className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4" />
                        3. Verification QR Code Options
                      </label>
                      <button
                        type="button"
                        onClick={() => setPlacementTool("qr")}
                        className="text-[11px] font-mono text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <Crosshair className="w-3 h-3" />
                        Set by Click
                      </button>
                    </div>

                    {/* QR Horizontal X Position */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>Horizontal Position (X %)</span>
                        <span className="text-purple-400 font-bold">{templateForm.qrX}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={templateForm.qrX}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrX: Number(e.target.value) })
                          }
                          className="flex-1 accent-purple-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={templateForm.qrX}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrX: Number(e.target.value) })
                          }
                          className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-center text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* QR Vertical Y Position */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>Vertical Position (Y %)</span>
                        <span className="text-purple-400 font-bold">{templateForm.qrY}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={templateForm.qrY}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrY: Number(e.target.value) })
                          }
                          className="flex-1 accent-purple-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={templateForm.qrY}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrY: Number(e.target.value) })
                          }
                          className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-center text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* QR Size (Width & Height) */}
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                        <span>QR Code Size / Dimensions (px)</span>
                        <span className="text-purple-400 font-bold">{templateForm.qrSize}px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="60"
                          max="260"
                          step="5"
                          value={templateForm.qrSize}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrSize: Number(e.target.value) })
                          }
                          className="flex-1 accent-purple-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="60"
                          max="260"
                          value={templateForm.qrSize}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, qrSize: Number(e.target.value) })
                          }
                          className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-center text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* Transparent QR Toggle (No white box / background) */}
                    <div className="pt-2 border-t border-gray-800/80">
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={templateForm.transparentQr}
                          onChange={(e) =>
                            setTemplateForm({ ...templateForm, transparentQr: e.target.checked })
                          }
                          className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
                        />
                        <span className="text-purple-300 font-semibold">
                          Transparent QR Code (No white background / box - directly overlaid)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-800 bg-[#0A121A] sticky bottom-0">
                <span className="text-xs text-gray-400 font-mono">
                  All 209 attendees will automatically use this layout upon saving.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-xl text-gray-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingTemplate}
                    className="px-6 py-2.5 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {uploadingTemplate ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving Template Settings...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Template Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Bulk Generation Modal */}
      {showConfirmBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24] border border-teal-500/40 rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-teal-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Generate Certificates for {selectedEvent?.title}
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              You are about to issue authentic certificates to{" "}
              <strong className="text-teal-400 font-mono">
                {bulkTarget === "attended"
                  ? `${stats?.attendedBothDaysCount !== undefined ? stats.attendedBothDaysCount : (stats?.attendedCount || 0)} students who attended BOTH days (22 & 23 Oct)`
                  : `${stats?.registeredCount || 0} registered students`}
              </strong>
              .
            </p>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-4 text-xs font-mono space-y-1.5 text-gray-400 mb-6">
              <div className="flex items-center gap-2 text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Each certificate gets a unique ID & cryptographic QR code</span>
              </div>
              <div>• Any already issued certificates will be preserved</div>
              <div>• Students will instantly see their certificates on their profile</div>
              <div>• The QR code can be scanned by any smartphone camera</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmBulkModal(false)}
                className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-xl text-gray-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={generating}
                className="px-5 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {generating ? "Generating..." : "Confirm & Issue Now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Single Issue Modal */}
      {showSingleIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24] border border-purple-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl relative max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Issue Individual Certificate
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Admin Authority: Issue to any individual (Attended or Not)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSingleIssueModal(false);
                  setStudentSearchQuery("");
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Override Authority Badge */}
            <div className="mb-4 p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Admin Override Power Active
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                As Admin, you have full authority to issue an authentic, verified certificate to <strong>any student or individual</strong>, whether they marked attendance or not. Quick-pick a student from the event directory below or manually enter any custom details.
              </p>
            </div>

            <form onSubmit={handleIssueSingle} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-sm">
              {/* Quick Search from Candidates */}
              <div className="relative">
                <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center justify-between">
                  <span>Quick Pick from Event Students (Optional):</span>
                  {singleForm.recipientName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSingleForm({
                          recipientName: "",
                          recipientRollNo: "",
                          recipientBranch: "",
                          recipientEmail: "",
                          userId: "",
                          certificateType: "participation",
                          customNotes: "",
                        });
                        setStudentSearchQuery("");
                      }}
                      className="text-purple-400 hover:text-purple-300 text-[11px] underline"
                    >
                      Clear & Enter Custom
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, roll no, or email..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-black/50 border border-gray-700 focus:border-purple-400 rounded-lg text-white text-xs font-mono focus:outline-none"
                  />
                  {studentSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStudentSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {studentSearchQuery.trim() && (
                  <div className="mt-1 max-h-48 overflow-y-auto bg-[#0A121A] border border-gray-700 rounded-xl divide-y divide-gray-800 text-xs shadow-2xl z-20">
                    {candidates
                      .filter(
                        (c) =>
                          c.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          c.rollno?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          c.email?.toLowerCase().includes(studentSearchQuery.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((c) => (
                        <div
                          key={c.userId || c.email}
                          onClick={() => {
                            setSingleForm({
                              recipientName: c.name,
                              recipientRollNo: c.rollno || "N/A",
                              recipientBranch: c.branch || "",
                              recipientEmail: c.email || "",
                              userId: c.userId || "",
                              certificateType: singleForm.certificateType || "participation",
                              customNotes: c.attended
                                ? "Verified attendee"
                                : "Attendance override granted by Admin",
                            });
                            setStudentSearchQuery("");
                          }}
                          className="p-2.5 hover:bg-purple-500/15 cursor-pointer flex items-center justify-between transition group"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {c.name}
                              {c.attended ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-mono">
                                  Attended
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                  Did Not Attend (Override)
                                </span>
                              )}
                              {c.hasCertificate && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                                  Has Cert
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-[11px] font-mono mt-0.5">
                              {c.rollno} • {c.branch || "General"} • {c.email}
                            </div>
                          </div>
                          <span className="text-purple-400 group-hover:text-purple-300 font-mono text-xs flex items-center gap-1">
                            Select <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    {candidates.filter(
                      (c) =>
                        c.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                        c.rollno?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                        c.email?.toLowerCase().includes(studentSearchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="p-3 text-center text-gray-500 font-mono text-xs">
                        No matching student found. You can fill details manually below!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recipient Full Name */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={singleForm.recipientName}
                  onChange={(e) =>
                    setSingleForm({ ...singleForm, recipientName: e.target.value })
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white font-medium focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Roll Number & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={singleForm.recipientRollNo}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, recipientRollNo: e.target.value })
                    }
                    placeholder="e.g. 23111"
                    className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Branch / Dept
                  </label>
                  <input
                    type="text"
                    value={singleForm.recipientBranch}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, recipientBranch: e.target.value })
                    }
                    placeholder="e.g. CSE / IT"
                    className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={singleForm.recipientEmail}
                  onChange={(e) =>
                    setSingleForm({ ...singleForm, recipientEmail: e.target.value })
                  }
                  placeholder="student@example.com"
                  className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Certificate Type & Custom Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Certificate Type
                  </label>
                  <select
                    value={singleForm.certificateType || "participation"}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, certificateType: e.target.value })
                    }
                    className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  >
                    <option value="participation">Participation</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="merit">Merit</option>
                    <option value="excellence">Excellence</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Admin Note / Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={singleForm.customNotes || ""}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, customNotes: e.target.value })
                    }
                    placeholder="e.g. Attendance override / Special contributor"
                    className="w-full p-2.5 bg-black/50 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleIssueModal(false);
                    setStudentSearchQuery("");
                  }}
                  className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-xl text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-400 hover:to-teal-300 text-black font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Issue Certificate Now
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreviewModal && selectedCertForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24] border border-teal-500/40 rounded-2xl p-6 w-full max-w-4xl shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-400" />
                  Certificate Preview: {selectedCertForPreview.recipientName}
                </h3>
                <span className="text-xs font-mono text-teal-400">
                  ID: {selectedCertForPreview.certificateId}
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Canvas Preview */}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner flex items-center justify-center mb-6">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-auto max-w-full block shadow-2xl rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
              <a
                href={getVerificationUrl(selectedCertForPreview.certificateId)}
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:text-teal-300 text-xs font-mono flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Open Public Verification Page
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const filename = `${selectedCertForPreview.recipientName.replace(
                      /\s+/g,
                      "_"
                    )}_${selectedCertForPreview.certificateId}.png`;
                    downloadCertificatePNG(previewCanvasRef.current, filename);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    const filename = `${selectedCertForPreview.recipientName.replace(
                      /\s+/g,
                      "_"
                    )}_${selectedCertForPreview.certificateId}.pdf`;
                    downloadCertificatePDF(
                      previewCanvasRef.current,
                      filename,
                      selectedCertForPreview
                    );
                  }}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
