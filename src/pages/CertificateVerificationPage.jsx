import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyCertificate, clearVerification } from "../redux/slices/certificateSlice.js";
import {
  renderCertificateToCanvas,
  resolveTemplateConfig,
  downloadCertificatePNG,
  downloadCertificatePDF,
} from "../utils/certificateRenderer.js";
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Download,
  Share2,
  Calendar,
  User,
  GraduationCap,
  ExternalLink,
  Search,
  ArrowLeft,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { verifiedCertificate, verifying, error } = useSelector((state) => state.certificates);

  const canvasRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (certificateId) {
      dispatch(verifyCertificate(certificateId));
    }
    return () => {
      dispatch(clearVerification());
    };
  }, [certificateId, dispatch]);

  // When verification succeeds, render the certificate onto canvas
  useEffect(() => {
    if (verifiedCertificate?.valid && verifiedCertificate.certificate) {
      const cert = verifiedCertificate.certificate;
      const template = resolveTemplateConfig(cert);

      setIsRendering(true);
      setTimeout(async () => {
        try {
          if (canvasRef.current) {
            await renderCertificateToCanvas(canvasRef.current, cert, template);
          }
        } catch (err) {
          console.error("Canvas render error:", err);
        } finally {
          setIsRendering(false);
        }
      }, 100);
    }
  }, [verifiedCertificate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim().toUpperCase()}`);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadPDF = () => {
    if (!canvasRef.current || !verifiedCertificate?.certificate) return;
    const cert = verifiedCertificate.certificate;
    const filename = `${cert.recipientName.replace(/\s+/g, "_")}_${cert.certificateId}.pdf`;
    downloadCertificatePDF(canvasRef.current, filename, cert);
    toast.success("Certificate PDF downloaded!");
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current || !verifiedCertificate?.certificate) return;
    const cert = verifiedCertificate.certificate;
    const filename = `${cert.recipientName.replace(/\s+/g, "_")}_${cert.certificateId}.png`;
    downloadCertificatePNG(canvasRef.current, filename);
    toast.success("Certificate PNG downloaded!");
  };

  const cert = verifiedCertificate?.certificate;
  const isValid = verifiedCertificate?.valid;
  const isRevoked = verifiedCertificate?.status === "revoked";

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to DSC Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-teal-950/40 border border-teal-500/30 text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>DSC RTU Official Verification Portal</span>
          </div>
        </div>

        {/* Search Bar for manual lookup */}
        <div className="mb-10">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Verify another certificate (e.g. DSC-GC-2026-XXXXX)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0F1A24]/90 border border-gray-700 focus:border-teal-400 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Loading State */}
        {verifying && (
          <div className="text-center py-20 bg-[#0F1A24]/80 backdrop-blur-md rounded-2xl border border-teal-500/20 p-8 shadow-2xl">
            <div className="w-14 h-14 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Verifying Certificate Credential...</h3>
            <p className="text-gray-400 text-sm font-mono">
              Checking cryptographic integrity with Developer Student Club database...
            </p>
          </div>
        )}

        {/* Invalid / Not Found State */}
        {!verifying && !isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24]/90 border border-red-500/40 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/40">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              {isRevoked ? "Certificate Revoked" : "Certificate Not Found"}
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto text-sm mb-6 leading-relaxed">
              {verifiedCertificate?.message ||
                "No certificate record exists for the provided ID. Please verify the QR code or contact Developer Student Club RTU coordinators."}
            </p>
            {certificateId && (
              <div className="inline-block px-4 py-2 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 font-mono text-sm mb-6">
                Queried ID: {certificateId}
              </div>
            )}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Return to Homepage
              </Link>
            </div>
          </motion.div>
        )}

        {/* Verified Certificate Content */}
        {!verifying && isValid && cert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Authenticity Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900/90 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <CheckCircle className="w-9 h-9 text-emerald-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wide uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Authentic Verified Credential
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {cert.recipientName}
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Officially certified for participating in{" "}
                    <span className="text-teal-400 font-semibold">{cert.eventTitle}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-gray-400" />
                  Download Image
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 bg-teal-950/50 hover:bg-teal-900/50 border border-teal-500/30 text-teal-300 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
                  title="Copy verification link"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copySuccess ? "Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-mono mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  Student Name
                </div>
                <div className="text-white font-bold text-base truncate">{cert.recipientName}</div>
                <div className="text-gray-500 text-xs mt-0.5">{cert.recipientEmail || "Registered"}</div>
              </div>

              <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-mono mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  Academic Roll No & Branch
                </div>
                <div className="text-white font-bold text-base">{cert.recipientRollNo || "N/A"}</div>
                <div className="text-gray-500 text-xs mt-0.5">{cert.recipientBranch || "DSC Participant"}</div>
              </div>

              <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-mono mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Certificate ID
                </div>
                <div className="text-teal-400 font-mono font-bold text-sm tracking-wider">
                  {cert.certificateId}
                </div>
                <div className="text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Cryptographically Verified
                </div>
              </div>

              <div className="bg-[#0F1A24]/90 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-mono mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Issue Date
                </div>
                <div className="text-white font-bold text-base">
                  {new Date(cert.issueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">Developer Student Club RTU</div>
              </div>
            </div>

            {/* Live Certificate Preview Canvas Card */}
            <div className="bg-[#0F1A24]/90 border border-teal-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-400" />
                    Official Certificate Document
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Rendered in high resolution with embedded anti-tamper verification QR code.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-mono">
                    <CheckCircle className="w-3 h-3" />
                    Original Credential
                  </span>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner flex items-center justify-center min-h-[350px]">
                {isRendering && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-400 text-xs font-mono">Rendering document...</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-w-full block shadow-2xl rounded-lg"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              {/* Security & Verification Explanation */}
              <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>
                    The QR code embedded on this certificate is unique and cryptographically matched to this student record.
                  </span>
                </div>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1 flex-shrink-0"
                >
                  Share to LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
