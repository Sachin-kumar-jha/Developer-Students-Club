import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages, registerForEvent, createRazorpayOrder, verifyRazorpayPayment } from "../redux/slices/eventSlice.js";
import { fetchRegistrations } from "../redux/slices/registrationSlice.js";
import axios from "axios";
import { useState } from "react";
import AuthModal from "../components/AuthModal.jsx";

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
      if (user) {
        dispatch(fetchRegistrations({ userId: user.id || user._id, role: user.role }));
      }
      if (onRefresh) onRefresh();
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
          setPaymentEvent(null);
          if (user) {
            dispatch(fetchRegistrations({ userId: user.id || user._id, role: user.role }));
          }
          if (onRefresh) onRefresh();
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
    </>
  );
}
