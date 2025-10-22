import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../redux/slices/eventSlice.js";
import EventPageSkeleton from "../components/Skeleton/EventPageSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthModal from "../components/AuthModal.jsx";
import axios from "axios";

export default function EventsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { events, loading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // useEffect(() => {
  //   if (error) toast.error(error);
  // }, [error]);

  const now = new Date();

  const upcomingEvents = events.filter(
    (e) => new Date(e.endDate) >= now
  );
  console.log(upcomingEvents);
  const pastEvents = events.filter(
    (e) => new Date(e.endDate) < now
  );

  const isAdmin = user?.role === "admin";

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        withCredentials: true,
      });
      toast.success(`${res.data.message}`);
      dispatch(fetchEvents()); // Refetch events after deletion
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };


  const handleEdit = (id) => {
    navigate(`/events/edit/${id}`);
  };

  const handleRegister = (eventId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/events/register/${eventId}`);
  };

  const handleMediaUpload=(eventId)=>{
    if(!isAdmin){
   navigate("/events");
   return;
    }
    navigate(`/events/media-upload/${eventId}`);

  }

  const handleAddEvent = () => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can add events!");
      return;
    }
    navigate("/events/add");
  };

  const handleResources = (eventId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/events/${eventId}/resources`);
  };


  const renderEventCard = (event, index, isPast = false) => (
    <motion.div
      key={event._id || index}
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
              onClick={() => handleRegister(event._id)}
            >
              Register →
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
      // onClick={() => navigate(`/events/${event._id}`)}
      />
    </motion.div>
  );

  return (
    <div className="bg-[#0F1A24] min-h-screen text-white px-6 md:px-20 py-12">
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <motion.div
        className="text-left mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-2">Events</h1>
        <p className="text-gray-400">
          Explore our upcoming and past events. Join us to learn, collaborate, and create!
        </p>

        {isAdmin && (
          <button
            onClick={handleAddEvent}
            className="mt-4 px-5 py-2 bg-teal-600 hover:bg-teal-400 rounded-lg shadow-md transition"
          >
            Add New Event
          </button>
        )}
      </motion.div>

      {/* Upcoming Events */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Upcoming Events</h2>
        {loading
          ? <EventPageSkeleton />
          : upcomingEvents.map((event, idx) => renderEventCard(event, idx, false))
        }
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Past Events</h2>
        {loading
          ? <EventPageSkeleton />
          : pastEvents.map((event, idx) => renderEventCard(event, idx, true))
        }
      </section>
    </div>
  );
}
