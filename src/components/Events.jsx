import { useEffect } from "react";
import FadeInSection from "./FadeInsection.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../redux/slices/eventSlice.js";
import EventSkeleton from "./Skeleton/EventSkeleton.jsx";
import { toast } from "react-toastify";

export default function Events() {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const now = new Date();

  const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now);

  console.log("Upcoming Events", upcomingEvents);

  return (
    <section id="events" className="py-20">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tighter text-left mb-12 px-6">
          Upcoming Events
        </h2>
      </FadeInSection>

      <div className="max-w-4xl mx-auto px-6">
        <div className="relative border-l border-gray-600 pl-8">
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
            <FadeInSection key={i}>
              <div className="mb-10 relative">
                <span className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-teal-400 border-2 border-[#0F1A24]" />
                <h3 className="text-lg font-semibold text-gray-200">{e.title}</h3>
                <h4 className="text-gray-200">{e.description}</h4>
                <span>
                  <p className="text-gray-400 text-sm">
                    Start Date:{" "}
                    {new Date(e.startDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    End Date:{" "}
                    {new Date(e.endDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </span>
              </div>
            </FadeInSection>
          ))}

          {/* Handle empty list */}
          {!loading && upcomingEvents.length === 0 && !error && (
            <p className="text-gray-400 text-center">No upcoming events.</p>
          )}
        </div>
      </div>
    </section>
  );
}
