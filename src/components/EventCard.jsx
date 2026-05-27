import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages, registerForEvent, registerForPaidEvent } from "../redux/slices/eventSlice.js";
import axios from "axios";
import { useState } from "react";
import AuthModal from "../components/AuthModal.jsx";

export default function EventCard({ event, index, isPast, isAdmin, onRefresh }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [paymentEvent, setPaymentEvent] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const handleRegister = async (id) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if ((event.fee || 0) > 0) {
      setPaymentEvent(event);
      return;
    }

    dispatch(clearMessages());
    const result = await dispatch(registerForEvent(id));

    if (registerForEvent.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload || "Failed to register for event");
    }
  };

  const handlePaidRegister = async (e) => {
    e.preventDefault();

    if (!paymentScreenshot) {
      toast.error("Please upload payment screenshot.");
      return;
    }

    dispatch(clearMessages());
    const result = await dispatch(
      registerForPaidEvent({ id: paymentEvent._id, paymentScreenshot })
    );

    if (registerForPaidEvent.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setPaymentEvent(null);
      setPaymentScreenshot(null);
    } else {
      toast.error(result.payload || "Failed to submit paid registration");
    }
  };

  const handleResources = (eventId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/gallery/highlights/${eventId}`);
  };

  const handleEdit = (id) => {
    if (!isAdmin) return;
    navigate(`/events/edit/${id}`);
  };

  const handleMediaUpload = (eventId) => {
    if (!isAdmin) return;
    navigate(`/events/media-upload/${eventId}`);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    setDeletingId(id);
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {isAuthModalOpen && <AuthModal onClose={() => { setAuthModalOpen(false); navigate("/"); }} />}

      <motion.div
        key={event._id || event.id || index}
        className="bg-[#0F1A24]/40 backdrop-blur-md border border-gray-800/80 rounded-3xl p-6 md:p-8 hover:border-teal-500/30 hover:shadow-[0_15px_30px_-10px_rgba(20,184,166,0.15)] transition-all duration-300 shadow-xl group mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Details Section */}
          <div className="md:col-span-7 text-left order-2 md:order-1">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isPast 
                  ? "bg-gray-800 text-gray-400 border border-gray-700/60" 
                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
              }`}>
                {isPast ? "Past Event" : "Upcoming"}
              </span>
              <span className="text-[10px] font-semibold bg-white/5 text-teal-300 border border-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {(event.fee || 0) > 0 ? `Rs. ${event.fee}` : "Free"}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors duration-300">
              {event.title}
            </h3>
            
            <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
              {event.description}
            </p>

            {/* Date Details */}
            <div className="flex flex-col gap-2 mb-6 font-mono text-xs text-gray-450">
              <div className="flex items-center gap-2">
                <span className="text-teal-400">▸ Start:</span>
                <span>
                  {new Date(event.startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">▸ End: &nbsp;</span>
                <span>
                  {new Date(event.endDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {!isAdmin && !isPast && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold font-mono uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
                  disabled={loading}
                  onClick={() => handleRegister(event._id)}
                >
                  {loading
                    ? "Registering..."
                    : (event.fee || 0) > 0
                      ? `Pay & Register`
                      : "Register Now ➔"}
                </motion.button>
              )}

              {!isAdmin && isPast && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#0F1A24] border border-gray-800 hover:border-teal-500/30 hover:bg-teal-500/10 text-teal-400 font-semibold font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300"
                  onClick={() => handleResources(event._id)}
                >
                  View Resources
                </motion.button>
              )}

              {isAdmin && (
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <button
                    onClick={() => handleEdit(event._id)}
                    className="px-4 py-2 bg-[#0F1A24] border border-teal-500/40 text-teal-400 hover:bg-teal-500/10 font-mono text-xs font-semibold rounded-lg transition duration-300 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-4 py-2 bg-red-950/20 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs font-semibold rounded-lg transition duration-300 cursor-pointer"
                  >
                    {deletingId === event._id ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => handleMediaUpload(event._id)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-mono text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition duration-300 cursor-pointer"
                  >
                    Upload Media
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="md:col-span-5 order-1 md:order-2">
            <div className="w-full h-56 md:h-64 rounded-2xl overflow-hidden border border-gray-800/80 shadow-lg relative bg-gray-900/60">
              <img
                src={
                  event.image ||
                  "https://t3.ftcdn.net/jpg/14/13/82/90/240_F_1413829003_bQFOIiMsXDLCJYp8KbVTTabm7RUv8GS7.jpg"
                }
                alt={event.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {paymentEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <form
            onSubmit={handlePaidRegister}
            className="w-full max-w-md bg-[#162330] border border-gray-700 rounded-xl p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-2">Payment Verification</h3>
            <p className="text-gray-300 mb-4">{paymentEvent.title}</p>
            <div className="bg-[#0F1A24] rounded-lg p-4 mb-4 text-sm text-gray-300">
              <p className="mb-1">
                Amount: <span className="text-teal-300 font-semibold">Rs. {paymentEvent.fee}</span>
              </p>
              {paymentEvent.upiId && (
                <>
                  <p className="mb-3">
                    UPI ID: <span className="text-white font-semibold">{paymentEvent.upiId}</span>
                  </p>
                  {/* Dynamic UPI QR Code */}
                  <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl w-36 h-36 mx-auto mb-3 border border-teal-400">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        `upi://pay?pa=${paymentEvent.upiId}&pn=${encodeURIComponent(paymentEvent.title)}&am=${paymentEvent.fee}&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-mono mb-2">
                    Scan using GPay, PhonePe, or Paytm
                  </p>
                </>
              )}
              <p className="mt-2 text-center text-xs">Pay using UPI / Scan QR, then upload your payment screenshot.</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentEvent(null);
                  setPaymentScreenshot(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
