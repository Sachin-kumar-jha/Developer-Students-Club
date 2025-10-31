import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/image.png";
import AuthModal from "./AuthModal.jsx";
import AvatarMenu from "./AvatarMenu.jsx";
import { useSelector } from "react-redux";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const user = useSelector((state) => state.auth.user);
  
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    // Set initial scroll state immediately on mount
    const initialScroll = window.scrollY > 100;
    setIsScrolled(initialScroll);
    
    // Disable initial load flag after a brief moment
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 50);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        animate={{
          paddingTop: isScrolled ? "0.75rem" : "0",
          paddingBottom: isScrolled ? "0rem" : "0",
        }}
      >
        <motion.div
          className="mx-auto bg-[#0F1A24]/95 backdrop-blur-md shadow-lg border border-gray-700/50"
          initial={false}
          animate={{
            maxWidth: isScrolled ? "90%" : "100%",
            borderRadius: isScrolled ? "1rem" : "0",
            marginTop: isScrolled ? "0.5rem" : "0",
          }}
          transition={isInitialLoad ? { duration: 0 } : { duration: 0.4, ease: "easeInOut" }}
        >
          <div className="px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <motion.h1
              className="flex items-center gap-2 text-2xl font-semibold tracking-tighter text-white"
              initial={false}
              animate={{
                fontSize: isScrolled ? "1.25rem" : "1.5rem",
              }}
              transition={isInitialLoad ? { duration: 0 } : { duration: 0.3 }}
            >
              <motion.img
                src={logo}
                alt="logo"
                className="object-cover"
                initial={false}
                animate={{
                  height: isScrolled ? "1.25rem" : "1.5rem",
                  width: isScrolled ? "1.25rem" : "1.5rem",
                }}
                transition={isInitialLoad ? { duration: 0 } : { duration: 0.3 }}
              />
              <span className="hidden sm:inline">Developer Students Club</span>
              <span className="sm:hidden">DSC</span>
            </motion.h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-gray-300">
              <Link to="/" className="hover:text-teal-400 transition">
                Home
              </Link>
              <Link to="/about" className="hover:text-teal-400 transition">
                About
              </Link>
              <Link to="/events" className="hover:text-teal-400 transition">
                Events
              </Link>
              <Link to="/team" className="hover:text-teal-400 transition">
                Team
              </Link>
              <Link to="/gallery" className="hover:text-teal-400 transition">
                Gallery
              </Link>
              <Link to="/contact" className="hover:text-teal-400 transition">
                Contact
              </Link>

              <div className="flex gap-3 ml-4">
                {!user ? (
                  <motion.button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-teal-400 text-black cursor-pointer rounded-lg font-semibold hover:bg-teal-300 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join Us
                  </motion.button>
                ) : (
                  <AvatarMenu user={user} />
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            {!isOpen && (
              <motion.button
                className="md:hidden text-teal-400 text-2xl focus:outline-none"
                onClick={() => setIsOpen(true)}
                whileTap={{ scale: 0.9 }}
              >
                ☰
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.nav>

      {/* Spacer to prevent content jump */}
      <div className="h-16" />

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-72 bg-[#0F1A24] z-50 md:hidden flex flex-col shadow-2xl border-l border-gray-700"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-white font-bold text-lg">Menu</h2>
                <motion.button
                  className="text-white text-3xl font-bold focus:outline-none"
                  onClick={closeMenu}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>

              <div className="flex flex-col items-start gap-6 p-6 text-gray-300 overflow-y-auto">
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/" className="text-lg">
                    Home
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/about" className="text-lg">
                    About
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/events" className="text-lg">
                    Events
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/team" className="text-lg">
                    Team
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/gallery" className="text-lg">
                    Gallery
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, color: "#5eead4" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link onClick={closeMenu} to="/contact" className="text-lg">
                    Contact
                  </Link>
                </motion.div>

                <div className="w-full pt-4 border-t border-gray-700">
                  {!user ? (
                    <motion.button
                      onClick={() => {
                        setShowAuthModal(true);
                        closeMenu();
                      }}
                      className="px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 w-full cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Join Us
                    </motion.button>
                  ) : (
                    <div className="flex justify-center w-full">
                      <AvatarMenu user={user} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </>
  );
}