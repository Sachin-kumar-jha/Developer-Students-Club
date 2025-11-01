import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
export default function AvatarMenu({ user }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const firstLetter = user?.name?.[0]?.toUpperCase();
  const [loading,setLoading]=useState(false);
  const handleProfileClick = () => {
    setOpen(false);
    navigate(`/profile/${user.id}`); // Redirect to profile page
  };

  const handleLogoutClick =async () => {
    setLoading(true);
    const res= await dispatch(logoutUser()).unwrap();
    setOpen(false);
    setLoading(false);
    navigate("/");
    toast.success(`${res?.message}`);
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
              {loading?<>
      <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
    </>:"Logout"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
