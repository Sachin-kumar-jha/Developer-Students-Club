import { useState } from "react";
import { motion } from "framer-motion";

export default function FeaturedVideos({ videos }) {
  const [videoError, setVideoError] = useState(false);
  if (!videos || videos.length === 0) return null;
  const mainVideo = videos[0];

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Featured Videos</h2>

      <motion.div
        className="rounded-lg overflow-hidden shadow-lg bg-[#162330] w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {!videoError ? (
          <video
            controls
            poster={mainVideo?.bannerImage || mainVideo?.image || ""}
            className="w-full h-[400px] md:h-[500px] lg:h-[550px] object-contain bg-cyan"
            onError={() => setVideoError(true)}
            src={mainVideo?.url || ""}
          />
        ) : (
          <img
            src={mainVideo?.bannerImage || mainVideo?.image || ""}
            alt={mainVideo?.title || "Featured Video"}
            className="w-full h-[400px] md:h-[500px] lg:h-[550px] object-cover"
          />
        )}
      </motion.div>
    </section>
  );
}
