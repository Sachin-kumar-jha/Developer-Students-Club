import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/image.png";
import AuthModal from "./AuthModal.jsx";
import AvatarMenu from "./AvatarMenu.jsx";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice.js"; // adjust path if needed

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  const dispatch = useDispatch();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0F1A24]/95 backdrop-blur-md shadow-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tighter text-white">
            <img src={logo} alt="logo" className="h-6 w-6 object-cover" />
            Developer Students Club
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-gray-300">
            <Link to="/" className="hover:text-teal-400 transition">Home</Link>
            <Link to="/about" className="hover:text-teal-400 transition">About</Link>
            <Link to="/events" className="hover:text-teal-400 transition">Events</Link>
            <Link to="/team" className="hover:text-teal-400 transition">Team</Link>
            <Link to="/gallery" className="hover:text-teal-400 transition">Gallery</Link>
            <Link to="/contact" className="hover:text-teal-400 transition">Contact</Link>

            <div className="flex gap-3 ml-4">
              {!user ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition"
                >
                  Join Us
                </button>
              ) : (
                <AvatarMenu user={user} onLogout={handleLogout} />
              )}

              <Link
                to="/events"
                className="px-4 py-2 border border-teal-400 text-teal-400 rounded-lg font-semibold hover:bg-teal-400 hover:text-black transition"
              >
                View Events
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          {!isOpen && (
            <button
              className="md:hidden text-teal-400 text-2xl focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              ☰
            </button>
          )}
        </div>

        {/* Mobile Slide Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-transparent z-40 md:hidden"
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="fixed top-0 right-0 h-full w-64 bg-transparent z-50 md:hidden flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
              >
                <div className="flex justify-end p-4">
                  <button
                    className="text-white text-2xl font-bold focus:outline-none"
                    onClick={closeMenu}
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col items-start gap-4 p-6 text-gray-300 bg-white/5 shadow-lg">
                  <Link onClick={closeMenu} to="/" className="hover:text-teal-400">Home</Link>
                  <Link onClick={closeMenu} to="/about" className="hover:text-teal-400">About</Link>
                  <Link onClick={closeMenu} to="/events" className="hover:text-teal-400">Events</Link>
                  <Link onClick={closeMenu} to="/team" className="hover:text-teal-400">Team</Link>
                  <Link onClick={closeMenu} to="/gallery" className="hover:text-teal-400">Gallery</Link>
                  <Link onClick={closeMenu} to="/contact" className="hover:text-teal-400">Contact</Link>

                  {!user ? (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        closeMenu();
                      }}
                      className="px-4 py-2 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 w-full"
                    >
                      Join Us
                    </button>
                  ) : (
                    <div className="flex justify-center w-full">
                      <AvatarMenu user={user} onLogout={handleLogout} />
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
