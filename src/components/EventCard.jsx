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
        className="grid md:grid-cols-2 gap-8 items-center mb-10"
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        viewport={{ once: true }}
      >
        <div>
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-gray-400 mb-4">
            {event.description?.length > 100
              ? `${event.description.slice(0, 100)}...`
              : event.description}
          </p>

          {!isAdmin && !isPast && (
            <>
              <p className="text-gray-500 text-sm mb-2">
                Start Date:{" "}
                {new Date(event.startDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                End Date:{" "}
                {new Date(event.endDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm mb-4 text-teal-300">
                {(event.fee || 0) > 0 ? `Fee: Rs. ${event.fee}` : "Free event"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-400 rounded-lg shadow-md transition mb-2 cursor-pointer"
                disabled={loading}
                onClick={() => handleRegister(event._id)}
              >
                {loading
                  ? "Registering..."
                  : (event.fee || 0) > 0
                    ? `Pay Rs. ${event.fee} & Register`
                    : "Register ->"}
              </motion.button>
            </>
          )}

          {!isAdmin && isPast && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md transition mb-2 cursor-pointer"
              onClick={() => handleResources(event._id)}
            >
              View Resources
            </motion.button>
          )}

          {isAdmin && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(event._id)}
                className="px-3 py-1 bg-teal-600 hover:bg-cyan-400 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event._id)}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-400 rounded"
              >
                {deletingId === event._id ? "...deleting" : "Delete"}
              </button>
              <button
                onClick={() => handleMediaUpload(event._id)}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-400 rounded"
              >
                Event Media
              </button>
            </div>
          )}
        </div>

        <motion.img
          src={
            event.image ||
            "https://t3.ftcdn.net/jpg/14/13/82/90/240_F_1413829003_bQFOIiMsXDLCJYp8KbVTTabm7RUv8GS7.jpg"
          }
          alt={event.title}
          className="rounded-xl shadow-lg cursor-pointer"
          whileHover={{ scale: 1.03 }}
        />
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
