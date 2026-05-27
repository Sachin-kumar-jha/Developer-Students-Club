import { useEffect } from "react";
import FadeInSection from "./FadeInsection.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../redux/slices/eventSlice.js";
import EventSkeleton from "./Skeleton/EventSkeleton.jsx";
import { Link } from "react-router-dom";

export default function Events() {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Date Logic
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now);

  return (
    <section id="events" className="py-24 max-w-6xl mx-auto px-6 text-left">
      <FadeInSection>
        <div className="mb-12">
          <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase mb-3 block">
            WHAT'S COMING UP
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
            Upcoming Events
          </h2>
        </div>
      </FadeInSection>

      <div className="max-w-4xl mx-auto pl-4 sm:pl-8">
        <div className="relative border-l border-gray-800 pl-8 space-y-2">
          {/* Show skeletons while loading */}
          {loading && (
            <>
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </>
          )}

          {/* Show upcoming events when loaded */}
          {!loading && upcomingEvents.length > 0 && upcomingEvents.map((e, i) => (
            <FadeInSection key={e._id || i}>
              <div className="mb-12 relative group">
                {/* Glowing pulsing dot on the timeline */}
                <span className="absolute -left-[41px] top-2.5 w-4.5 h-4.5 rounded-full bg-teal-400 border-4 border-[#0F1A24] group-hover:scale-125 group-hover:bg-teal-300 group-hover:shadow-[0_0_15px_rgba(45,212,191,0.8)] transition-all duration-300 z-10" />
                
                {/* Premium Glassmorphic Event Card */}
                <div className="bg-[#0F1A24]/40 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-xl hover:border-teal-500/30 hover:shadow-[0_12px_30px_-10px_rgba(20,184,166,0.12)] transition-all duration-300">
                  {/* Badge Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Upcoming
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      📅 {new Date(e.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors duration-300">
                    {e.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                    {e.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800/60 pt-4">
                    <span className="font-mono">
                      Time: {new Date(e.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - {new Date(e.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Link to="/events" className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors">
                      Register Now ➔
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}

          {/* Handle empty list */}
          {!loading && upcomingEvents.length === 0 && !error && (
            <div className="py-12 text-center bg-[#0F1A24]/20 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500 font-light">No upcoming events scheduled right now. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
