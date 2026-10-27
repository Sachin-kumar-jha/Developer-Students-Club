import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages, registerForEvent, createRazorpayOrder, verifyRazorpayPayment } from "../redux/slices/eventSlice.js";
import { fetchRegistrations } from "../redux/slices/registrationSlice.js";
import axios from "axios";
import { useState } from "react";
import AuthModal from "../components/AuthModal.jsx";
import { MessageCircle, ExternalLink, Check, Copy, X } from "lucide-react";

export default function EventCard({ event, index, isPast, isAdmin, onRefresh }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const { registrations } = useSelector((state) => state.registrations);

  const isRegistered = registrations?.some(
    (r) => (r.eventId?._id || r.eventId) === event._id
  );
  const myRegistration = registrations?.find(
    (r) => (r.eventId?._id || r.eventId) === event._id
  );

  const effectiveWhatsappLink = event.whatsappLink || myRegistration?.eventId?.whatsappLink || "";

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [paymentEvent, setPaymentEvent] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [registrationSuccessModal, setRegistrationSuccessModal] = useState(null);
  const [copied, setCopied] = useState(false);

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
      if (user) {
        dispatch(fetchRegistrations({ userId: user.id || user._id, role: user.role }));
      }
      if (onRefresh) onRefresh();

      const groupLink = result.payload?.whatsappLink || event.whatsappLink || "";
      if (groupLink) {
        setRegistrationSuccessModal({
          title: event.title,
          whatsappLink: groupLink,
        });
      }
    } else {
      toast.error(result.payload || "Failed to register for event");
    }
  };

  const handlePaidRegister = async (e) => {
    e.preventDefault();

    dispatch(clearMessages());
    
    // 1. Create Razorpay order on backend
    const orderResult = await dispatch(createRazorpayOrder(paymentEvent._id));
    
    if (!createRazorpayOrder.fulfilled.match(orderResult)) {
      toast.error(orderResult.payload || "Failed to initiate payment");
      return;
    }

    const { order, razorpayKeyId } = orderResult.payload;

    // 2. Configure Razorpay options
    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: "Developer Student Club",
      description: `Registration fee for ${paymentEvent.title}`,
      image: "/image.png",
      order_id: order.id,
      handler: async function (response) {
        // Success callback
        const verifyResult = await dispatch(
          verifyRazorpayPayment({
            id: paymentEvent._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        );

        if (verifyRazorpayPayment.fulfilled.match(verifyResult)) {
          toast.success(verifyResult.payload.message || "Payment verified successfully!");
          const currentPaidEvent = paymentEvent;
          setPaymentEvent(null);
          if (user) {
            dispatch(fetchRegistrations({ userId: user.id || user._id, role: user.role }));
          }
          if (onRefresh) onRefresh();

          const groupLink = verifyResult.payload?.whatsappLink || currentPaidEvent?.whatsappLink || event.whatsappLink || "";
          if (groupLink) {
            setRegistrationSuccessModal({
              title: currentPaidEvent?.title || event.title,
              whatsappLink: groupLink,
            });
          }
        } else {
          toast.error(verifyResult.payload || "Payment verification failed");
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: {
        color: "#14b8a6", // Teal color matching the site theme
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment window closed");
        }
      }
    };

    // 3. Open Razorpay checkout modal
    const rzp = new window.Razorpay(options);
    rzp.open();
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
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <motion.div
        key={event._id || event.id || index}
        className="bg-[#0A121A]/60 backdrop-blur-lg border border-teal-500/20 rounded-3xl p-6 md:p-8 card-3d-hover shadow-2xl group mb-10"
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
                  whileHover={isRegistered ? {} : { scale: 1.02 }}
                  whileTap={isRegistered ? {} : { scale: 0.98 }}
                  className={`px-6 py-3 font-bold font-mono uppercase tracking-wider rounded-xl transition-all duration-300 ${
                    isRegistered
                      ? "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 text-black hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] cursor-pointer"
                  }`}
                  disabled={loading || isRegistered}
                  onClick={() => handleRegister(event._id)}
                >
                  {loading
                    ? "Registering..."
                    : isRegistered
                      ? myRegistration?.paymentStatus === "pending"
                        ? "Pending Approval"
                        : "Registered"
                      : (event.fee || 0) > 0
                        ? "Pay & Register"
                        : "Register Now ➔"}
                </motion.button>
              )}

              {!isAdmin && !isPast && isRegistered && effectiveWhatsappLink && (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={effectiveWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-bold font-mono uppercase tracking-wider rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-black" />
                  <span>Join WhatsApp Group</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </motion.a>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#162330]/90 border border-teal-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Design Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
            
            <h3 className="text-2xl font-bold mb-1 text-white">Event Registration</h3>
            <p className="text-teal-400 font-mono text-xs uppercase tracking-wider mb-6">&gt; Secure Payment Gateway</p>
            
            <div className="bg-[#0F1A24]/60 border border-gray-800 rounded-2xl p-5 mb-6 text-sm text-gray-300">
              <div className="mb-4">
                <span className="text-gray-500 block text-xs font-mono mb-1">Event Name</span>
                <span className="text-white font-semibold text-lg">{paymentEvent.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 block text-xs font-mono mb-1">Registration Fee</span>
                  <span className="text-teal-300 font-extrabold text-xl">Rs. {paymentEvent.fee}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs font-mono mb-1">Currency</span>
                  <span className="text-white font-semibold text-base">INR</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handlePaidRegister}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-extrabold font-mono uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 text-center"
              >
                {loading ? "Processing..." : "Proceed to Pay"}
              </button>
              <button
                type="button"
                onClick={() => setPaymentEvent(null)}
                className="w-full py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold hover:text-white transition duration-300 cursor-pointer text-center text-sm font-mono"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Powered by Razorpay Secure Payments</span>
            </div>
          </div>
        </div>
      )}

      {/* Registration Success Modal with WhatsApp Group Link */}
      {registrationSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[#0F1A24] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden text-center space-y-6"
          >
            {/* Top gradient highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"></div>

            {/* Close button */}
            <button
              onClick={() => setRegistrationSuccessModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                Registration Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                You're In! 🎉
              </h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                You have successfully registered for <strong className="text-teal-300">{registrationSuccessModal.title}</strong>.
              </p>
            </div>

            {/* WhatsApp Card */}
            {registrationSuccessModal.whatsappLink && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black/60 to-[#0F1A24] border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                    <MessageCircle className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Join the Official WhatsApp Group</h4>
                    <p className="text-xs text-gray-400 font-mono">
                      Workshop links, room venues & announcements
                    </p>
                  </div>
                </div>

                <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                  Follow this link to join the WhatsApp group and stay connected with the organizers and participants:
                </p>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-gray-800 text-xs font-mono text-gray-400 break-all">
                  <span className="truncate flex-1 text-teal-300 select-all">
                    {registrationSuccessModal.whatsappLink}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(registrationSuccessModal.whatsappLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      toast.info("WhatsApp link copied to clipboard!");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer font-sans font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <a
                  href={registrationSuccessModal.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-black" />
                  Join WhatsApp Group Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setRegistrationSuccessModal(null)}
              className="w-full py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold hover:text-white transition duration-300 cursor-pointer text-center text-sm font-mono"
            >
              Done / Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
