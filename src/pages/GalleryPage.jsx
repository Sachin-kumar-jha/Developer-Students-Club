"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMedia } from "../redux/slices/mediaSlice";
import { fetchEvents } from "../redux/slices/eventSlice";
import { motion } from "framer-motion";

import HighlightsSection from "../components/Gallery/HighlightSection.jsx";
import PastEventsSection from "../components/Gallery/PastEventSection.jsx";
import FeaturedVideos from "../components/Gallery/FeaturedVideos.jsx";
import GalleryPageSkeleton from "../components/Gallery/GalleryPageSkeleton.jsx";

export default function GalleryPage() {
  const dispatch = useDispatch();

  const {
    allMedia,
    loading: mediaLoading,
    error: mediaError,
  } = useSelector((state) => state.media);

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchAllMedia());
    dispatch(fetchEvents());
  }, [dispatch]);

  const isLoading = mediaLoading || eventsLoading;
  const isError = mediaError || eventsError;

  if (isLoading) return <GalleryPageSkeleton />;
  if (isError)
    return <p className="text-red-400 text-center mt-20">{isError}</p>;

  const today = new Date();

  // Highlight events (upcoming or ongoing)
  const highlightEventsWithMedia =
    events.length && allMedia.length
      ? events
          .filter((event) => new Date(event.endDate) >= today)
          .map((event) => {
            const eventMedia = allMedia.filter(
              (m) => String(m.eventId) === String(event._id)
            );
            return {
              eventId: event._id,
              title: event.title,
              highlightImage: eventMedia.find((m) => !m.url.includes("video")),
              media: eventMedia,
            };
          })
      : [];

  // Past events (already happened)
  const pastEventsMedia =
    events.length && allMedia.length
      ? events
          .filter((event) => new Date(event.endDate) < today)
          .map((event) =>
            allMedia
              .filter((m) => String(m.eventId) === String(event._id))
              .map((m) => ({ ...m, eventDate: event.startDate }))
          )
          .flat()
      : [];

  // Featured videos
  const videos = allMedia.filter((m) => m.url.includes("video"));

  return (
    <div className="bg-[#0F1A24] min-h-screen text-white px-6 md:px-20 py-12">
      {/* Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Our Gallery</h1>
      </motion.div>

      {/* Highlights */}
      <HighlightsSection highlights={highlightEventsWithMedia} />

      {/* Featured Videos */}
      <FeaturedVideos videos={videos} />

      {/* Past Events */}
      <PastEventsSection media={pastEventsMedia} />
    </div>
  );
}
