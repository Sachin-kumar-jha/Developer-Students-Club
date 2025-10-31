"use client";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMedia } from "../../redux/slices/mediaSlice.js";
import { motion } from "framer-motion";
import MediaCard from "../MediaCard.jsx";

export default function EventHighlightsPage() {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allMedia, loading, error } = useSelector((state) => state.media);
  const { events } = useSelector((state) => state.events);

  useEffect(() => {
    if (!allMedia.length) dispatch(fetchAllMedia());
  }, [dispatch, allMedia.length]);

  const event = events.find((e) => e._id === eventId);

  if (!event && !loading) {
    return (
      <div className="text-center text-red-400 mt-20">
        Event not found.
      </div>
    );
  }

  const eventMedia = allMedia.filter((m) => m.eventId === eventId);

  return (
    <div className="bg-[#0F1A24] min-h-screen text-white px-6 md:px-20 py-12">
      {/* Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">{event?.title || "Loading..."}</h1>
        <button
          className="text-teal-400 underline text-sm cursor-pointer"
          onClick={() => navigate(-1)}
        >
          ← Back to Gallery
        </button>
      </motion.div>

      {loading && <p className="text-gray-400 text-center">Loading media...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {!loading && !error && eventMedia.length === 0 && (
        <p className="text-gray-400 text-center">No media found for this event.</p>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {eventMedia.map((media) => (
          <MediaCard key={media._id} media={media} />
        ))}
      </div>
    </div>
  );
}
