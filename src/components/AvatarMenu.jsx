import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";

export default function AvatarMenu({ user }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const firstLetter = user?.name?.[0]?.toUpperCase();
  const handleProfileClick = () => {
    setOpen(false);
    navigate(`/profile/${user.id}`); // Redirect to profile page
  };

  const handleLogoutClick = () => {
    dispatch(logoutUser());
    setOpen(false);
    navigate("/");
  };
    

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-teal-500 text-black font-bold flex items-center justify-center hover:opacity-90"
      >
        {firstLetter || "U"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 mt-3 w-40 bg-[#162330] text-gray-200 rounded-lg shadow-lg overflow-hidden border border-gray-700 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="block w-full text-left px-4 py-2 hover:bg-teal-500/20"
              onClick={handleProfileClick}
            >
              Profile
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-teal-500/20"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
