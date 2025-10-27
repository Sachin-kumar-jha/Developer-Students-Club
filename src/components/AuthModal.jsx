import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const dispatch = useDispatch();
  const { loading} = useSelector((state) => state.auth);

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (isLogin) {
     const res=await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap();
     toast.success(`${res?.message}`);
    } else {
      const res= await dispatch(registerUser(formData)).unwrap();
      toast.success(`${res?.message}`);
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#162330] text-white rounded-xl p-8 w-[90%] max-w-md shadow-lg relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* {error && <p className="text-red-400 text-center">{error}</p>} */}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
            <input
              type="text"
              placeholder="Full Name"
              className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="example: 23111"
              className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
              onChange={(e) => setFormData({ ...formData, rollno: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="example: Information Technology or IT"
              className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              required
            />
            <input
              type="number"
              min={1}
              max={4}
              placeholder="enter your year"
              className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
       </>
          )}
          <input
            type="email"
            placeholder="example: abc123@gmail.com"
            className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-400 text-black font-semibold py-2 rounded hover:bg-teal-300 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="text-teal-400 hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="text-teal-400 hover:underline">
                Login
              </button>
            </>
          )}
        </p>

        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-2xl font-bold text-gray-400 hover:text-white"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}
