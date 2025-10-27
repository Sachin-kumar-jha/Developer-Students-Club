import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, clearMessages } from "../redux/slices/eventSlice.js";
import EventPageSkeleton from "../components/Skeleton/EventPageSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthModal from "../components/AuthModal.jsx";
import EventCard from "../components/EventCard.jsx";

export default function EventPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { events, loading, successMessage, error } = useSelector(
    (state) => state.events
  );
  const { user } = useSelector((state) => state.auth);

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Fetch all events
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Toast for success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [successMessage, error, dispatch]);

  //Logic for date
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now);
  const pastEvents = events.filter((e) => new Date(e.endDate) < now);

  const isAdmin = user?.role === "admin";

  const handleAddEvent = () => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can add events!");
      return;
    }
    navigate("/events/add");
  };

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
        {loading ? (
          <EventPageSkeleton />
        ) : (
          upcomingEvents.map((event, idx) => (
            <EventCard
              key={event._id}
              event={event}
              index={idx}
              isPast={false}
              isAdmin={isAdmin}
              onRefresh={() => dispatch(fetchEvents())}
            />
          ))
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Past Events</h2>
        {loading ? (
          <EventPageSkeleton />
        ) : (
          pastEvents.map((event, idx) => (
            <EventCard
              key={event._id}
              event={event}
              index={idx}
              isPast={true}
              isAdmin={isAdmin}
              onRefresh={() => dispatch(fetchEvents())}
            />
          ))
        )}
      </section>
    </div>
  );
}
