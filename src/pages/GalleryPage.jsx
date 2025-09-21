"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import FeaturedVideos from "../components/FeaturedVideos";

const highlights = [
    { title: "Tech Talk on Cloud Computing", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    { title: "Hackathon Project Showcase", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    { title: "Workshop on Web Development", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    { title: "Networking Mixer with Industry Experts", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    { title: "Community Outreach Program", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    { title: "End-of-Year Celebration", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
];

const pastEventsData = {
    2022: [
        { title: "Year-End Awards Ceremony", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    ],
    2023: [
        { title: "Summer Coding Camp", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
        { title: "Fall Career Fair", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
        { title: "Winter Hackathon", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    ],
    2024: [
        { title: "2024 Kickoff Event", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
        { title: "Mid-Year Project Review", image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg" },
    ],
};

export default function GalleryPage() {
    const [year, setYear] = useState("2024");

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

            {/* Event Highlights */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-6">Event Highlights</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {highlights.map((event, index) => (
                        <motion.div
                            key={index}
                            className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            viewport={{ once: true }}
                        >
                            <img src={event.image} alt={event.title} className="w-full h-28 object-cover" />
                            <p className="p-3 text-sm text-center">{event.title}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Video */}
            <FeaturedVideos />


            {/* Past Events */}
            <section>
                <h2 className="text-2xl font-semibold mb-6">Past Events</h2>

                {/* Year Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-700">
                    {Object.keys(pastEventsData).map((y) => (
                        <button
                            key={y}
                            onClick={() => setYear(y)}
                            className={`relative -mb-[1px] pb-2 text-sm font-medium transition-colors ${year === y
                                    ? "border-b-1 border-gray-400 text-white"
                                    : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            {y}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {pastEventsData[year].map((event, index) => (
                        <motion.div
                            key={index}
                            className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-28 object-cover"
                            />
                            <p className="p-3 text-sm text-center">{event.title}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

        </div>
    );
}
