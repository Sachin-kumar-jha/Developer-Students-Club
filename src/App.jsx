import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Events from "./components/Events";
import Team from "./components/Team";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import AddEventPage from "./components/Event/AddEvent";
import EventMediaUpload from "./components/Event/EventMediaUpload";
import { SuspenseLoader} from "./components/Skeleton/SuspenseLoader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load GET API pages
const EventPage = lazy(() => import("./pages/EventPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const EventHighlightsPage = lazy(() => import("./components/Gallery/EventHighlightsPage"));




export default function App() {
  return (
    <>
      <div className="bg-[#0F1A24] text-white w-full min-h-screen">
        <Navbar />
        <div className="md:px-10">
          <Routes>
            {/* Home Page (with all sections stacked) */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <About />
                  <Events />
                  <Team />
                  <Gallery />
                  <Contact />
                </>
              }
            />

            {/* About Page as Separate Route */}
            <Route path="/about" element={<AboutPage />} />

            {/* Events Page (lazy loaded) */}
            <Route
              path="/events"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <EventPage />
                </Suspense>
              }
            />
            <Route path="/events/add" element={<AddEventPage />} />
            <Route path="/events/edit/:id" element={<AddEventPage />} />
            {/* 🔹 Media upload route (admin only) */}
            <Route path="/events/media-upload/:eventId" element={<EventMediaUpload />} />

            {/* Team Page */}
            <Route path="/team" element={<TeamPage />} />

            {/* Gallery Page (lazy loaded) */}
            <Route
              path="/gallery"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <GalleryPage />
                </Suspense>
              }
            />
            <Route
              path="/gallery/highlights/:eventId"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <EventHighlightsPage />
                </Suspense>
              }
            />

            {/* Contact Page */}
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Footer />
      </div>
    </>
  );
}
