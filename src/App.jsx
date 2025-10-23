import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useState } from "react";
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
import { SuspenseLoader } from "./components/Skeleton/SuspenseLoader";
import { ToastContainer } from "react-toastify";
import AuthModal from "./components/AuthModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const EventPage = lazy(() => import("./pages/EventPage.jsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.jsx"));
const EventHighlightsPage = lazy(() => import("./components/Gallery/EventHighlightsPage"));

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <div className="bg-[#0F1A24] text-white w-full min-h-screen">
        <Navbar />
        <div className="md:px-10">
          <Routes>
            {/* Home Page (always accessible) */}
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

            {/* Profile Page */}
            <Route
              path="/profile/:userId"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                    <ProfilePage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* About Page */}
            <Route
              path="/about"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <AboutPage />
                </ProtectedRoute>
              }
            />

            {/* Events Page */}
            <Route
              path="/events"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                    <EventPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/events/add"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <AddEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/edit/:id"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <AddEventPage />
                </ProtectedRoute>
              }
            />

            {/* Media upload (admin only) */}
            <Route
              path="/events/media-upload/:eventId"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <EventMediaUpload />
                </ProtectedRoute>
              }
            />

            {/* Team Page */}
            <Route
              path="/team"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />

            {/* Gallery Pages */}
            <Route
              path="/gallery"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                    <GalleryPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="/gallery/highlights/:eventId"
              element={
                <Suspense fallback={<SuspenseLoader />}>
                  <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                    <EventHighlightsPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* Contact Page */}
            <Route
              path="/contact"
              element={
                <ProtectedRoute onAuthRequired={() => setShowAuthModal(true)}>
                  <Contact />
                </ProtectedRoute>
              }
            />
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
