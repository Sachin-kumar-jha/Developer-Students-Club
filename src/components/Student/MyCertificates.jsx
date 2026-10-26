import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCertificates } from "../../redux/slices/certificateSlice.js";
import {
  renderCertificateToCanvas,
  resolveTemplateConfig,
  downloadCertificatePNG,
  downloadCertificatePDF,
  getVerificationUrl,
} from "../../utils/certificateRenderer.js";
import {
  Award,
  Download,
  Eye,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Share2,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function MyCertificates() {
  const dispatch = useDispatch();
  const { myCertificates, loading } = useSelector((state) => state.certificates);

  const [selectedCert, setSelectedCert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  // When modal is open and certificate selected, render on canvas
  useEffect(() => {
    if (showModal && selectedCert && canvasRef.current) {
      setTimeout(async () => {
        try {
          const tConfig = resolveTemplateConfig(selectedCert);
          await renderCertificateToCanvas(canvasRef.current, selectedCert, tConfig);
        } catch (err) {
          console.error("Failed to render certificate canvas:", err);
        }
      }, 100);
    }
  }, [showModal, selectedCert]);

  const handleDownloadPDF = async (cert) => {
    try {
      const tempCanvas = document.createElement("canvas");
      const tConfig = resolveTemplateConfig(cert);
      await renderCertificateToCanvas(tempCanvas, cert, tConfig);
      const filename = `${cert.recipientName.replace(/\s+/g, "_")}_${
        cert.certificateId
      }.pdf`;
      downloadCertificatePDF(tempCanvas, filename, cert);
      toast.success("Certificate PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF");
    }
  };

  const handleCopyLink = (certId) => {
    const url = getVerificationUrl(certId);
    navigator.clipboard.writeText(url);
    toast.success("Certificate verification link copied!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-teal-400" />
            YOUR CERTIFICATES
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Official credentials earned by participating in Developer Student Club events.
          </p>
        </div>

        {myCertificates.length > 0 && (
          <div className="px-3.5 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 font-mono text-sm font-bold">
            {myCertificates.length} {myCertificates.length === 1 ? "Certificate" : "Certificates"}
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-sm">Loading your certificates...</p>
        </div>
      ) : myCertificates.length === 0 ? (
        <div className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Certificates Available Yet</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Certificates are issued to students who attend our workshops and events (like Git Connect). Once coordinators distribute certificates, they will appear here with your verification QR code!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myCertificates.map((cert) => (
            <motion.div
              key={cert._id}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-[#0F1A24]/90 to-black/90 border border-teal-500/30 hover:border-teal-400/60 rounded-2xl p-6 shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition"></div>

              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
                        Certificate of Participation
                      </span>
                      <h3 className="text-xl font-bold text-white">{cert.eventTitle}</h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex-shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-gray-400 mb-6 bg-black/40 rounded-xl p-3.5 border border-gray-800">
                  <div className="flex justify-between">
                    <span>Student:</span>
                    <span className="text-white font-bold">{cert.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roll Number:</span>
                    <span className="text-white">{cert.recipientRollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate ID:</span>
                    <span className="text-teal-400 font-bold">{cert.certificateId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span className="text-gray-300">
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                <button
                  onClick={() => {
                    setSelectedCert(cert);
                    setShowModal(true);
                  }}
                  className="flex-1 py-2 px-3 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View & Download
                </button>

                <button
                  onClick={() => handleDownloadPDF(cert)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition cursor-pointer"
                  title="Quick Download PDF"
                >
                  <Download className="w-4 h-4 text-gray-300" />
                </button>

                <button
                  onClick={() => handleCopyLink(cert.certificateId)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition cursor-pointer"
                  title="Copy Verification Link"
                >
                  <Share2 className="w-4 h-4 text-teal-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View & Download Modal */}
      {showModal && selectedCert && (
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
                  {selectedCert.eventTitle} — Official Certificate
                </h3>
                <span className="text-xs font-mono text-teal-400">
                  Credential ID: {selectedCert.certificateId}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Canvas Preview */}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner flex items-center justify-center mb-6">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-w-full block shadow-2xl rounded-lg"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
              <a
                href={getVerificationUrl(selectedCert.certificateId)}
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
                    const filename = `${selectedCert.recipientName.replace(
                      /\s+/g,
                      "_"
                    )}_${selectedCert.certificateId}.png`;
                    downloadCertificatePNG(canvasRef.current, filename);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    const filename = `${selectedCert.recipientName.replace(
                      /\s+/g,
                      "_"
                    )}_${selectedCert.certificateId}.pdf`;
                    downloadCertificatePDF(
                      canvasRef.current,
                      filename,
                      selectedCert
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
