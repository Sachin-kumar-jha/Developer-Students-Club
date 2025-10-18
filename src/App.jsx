import { Routes, Route } from "react-router-dom";
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
import EventPage from "./pages/EventPage"
import GalleryPage from "./pages/GalleryPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

            {/* Events Page */}
            <Route path="/events" element={<EventPage />} />

            {/* Team Page */}
            <Route path="/team" element={<TeamPage />} />

            {/* Gallery Page */}
            <Route path="/gallery" element={<GalleryPage />} />

            {/* Contact Page */}
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
         <ToastContainer
        position="top-right"
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
