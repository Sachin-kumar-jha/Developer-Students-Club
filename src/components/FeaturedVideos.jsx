import { useState } from "react";
import { motion } from "framer-motion";
import thumnail from "../assets/carbon.png"
import video from "../assets/video.mp4"
export default function FeaturedVideos() {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="mt-12 mb-10">
      <h2 className="text-2xl font-semibold mb-6">Featured Videos</h2>

      <motion.div
        className="rounded-sm overflow-hidden shadow-lg bg-[#162330]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {!videoError ? (
          <video
            controls
            poster={thumnail}
            className="w-full h-[400px] object-cover"
            onError={() => setVideoError(true)}
            src={video}
          >
            <source src="/videos/featured-event.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={thumnail}
            alt="Featured Event Thumbnail"
            className="w-full h-[400px] object-cover"
          />
        )}
      </motion.div>
    </section>
  );
}
