import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages, registerForEvent } from "../redux/slices/eventSlice.js";
import axios from "axios";
import { useState} from "react";
import AuthModal from "../components/AuthModal.jsx"; // ✅ Import AuthModal

export default function EventCard({ event, index, isPast, isAdmin, onRefresh }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, successMessage, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  
  const handleRegister = (id) => {
    if (!user) {
      setAuthModalOpen(true); 
      return;
    }
    dispatch(clearMessages());
    dispatch(registerForEvent(id));
    if(successMessage)toast.success(successMessage);
    if(error)toast.error(error);
  };

  const handleResources = (eventId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/events/${eventId}/resources`);
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

          {/* Non-admin users */}
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-400 rounded-lg shadow-md transition mb-2 cursor-pointer"
                disabled={loading}
                onClick={() => handleRegister(event._id)}
              >
                {loading ? "Registering..." : "Register →"}
              </motion.button>
            </>
          )}

          {/* Past Events for Users */}
          {!isAdmin && isPast && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md transition mb-2 cursor-pointer"
              onClick={() => handleResources(event._id)}
            >
              View Resources →
            </motion.button>
          )}

          {/* Admin Buttons */}
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
    </>
  );
}
