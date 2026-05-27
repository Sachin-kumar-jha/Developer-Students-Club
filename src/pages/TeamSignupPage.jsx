import axios from "axios";
import { Camera, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../redux/slices/authSlice";

const initialFormData = {
  name: "",
  rollno: "",
  branch: "",
  year: "",
  email: "",
  password: "",
};

export default function TeamSignupPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setProfileImage(file || null);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profileImage) {
      toast.error("Please select a profile photo");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    payload.append("profileImage", profileImage);

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/team/register`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(setUser(response.data.user));
      toast.success(response.data?.message || "Team member registered successfully");
      navigate(`/profile/${response.data.user.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1A24] text-white px-6 py-16">
      <section className="max-w-xl mx-auto">
        <div className="mb-10 text-left">
          <p className="text-teal-400 font-mono text-sm mb-2">Team invitation</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Team Member Sign Up
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#0F1A24]/40 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          {/* Avatar Upload */}
          <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dashed border-teal-500/30 bg-[#0F1A24]/60 cursor-pointer hover:border-teal-400 transition-all duration-300 group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-teal-400 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:border-teal-400/30 transition-all duration-300">
                <Camera className="w-9 h-9 text-teal-300" />
              </div>
            )}
            <span className="text-sm text-gray-400 group-hover:text-teal-300 transition-colors duration-300">Upload profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
          </label>

          {/* Form Fields */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Roll Number</label>
            <input
              type="number"
              name="rollno"
              placeholder="E.g., 23111"
              value={formData.rollno}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Branch</label>
            <input
              type="text"
              name="branch"
              placeholder="E.g., Information Technology"
              value={formData.branch}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Academic Year</label>
            <input
              type="number"
              name="year"
              min={1}
              max={4}
              placeholder="Enter your year (1 - 4)"
              value={formData.year}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="abc123@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold font-mono uppercase tracking-wider py-4 rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            {isSubmitting ? "Registering..." : "Register as Team Member"}
          </button>
        </form>
      </section>
    </main>
  );
}
