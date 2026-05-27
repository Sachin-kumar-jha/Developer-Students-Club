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
    <main className="min-h-screen bg-[#0F1A24] text-white px-6 py-12">
      <section className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-teal-400 font-mono text-sm mb-2">Team invitation</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Team Member Sign Up
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#162330] border border-gray-700 rounded-xl p-6 shadow-xl">
          <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-teal-400/60 bg-[#0F1A24] cursor-pointer hover:border-teal-300 transition">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-teal-400"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-teal-400/10 flex items-center justify-center border border-teal-400/50">
                <Camera className="w-9 h-9 text-teal-300" />
              </div>
            )}
            <span className="text-sm text-gray-300">Upload profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
          </label>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />
          <input
            type="number"
            name="rollno"
            placeholder="example: 23111"
            value={formData.rollno}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />
          <input
            type="text"
            name="branch"
            placeholder="example: Information Technology or IT"
            value={formData.branch}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />
          <input
            type="number"
            name="year"
            min={1}
            max={4}
            placeholder="Enter your year"
            value={formData.year}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="example: abc123@gmail.com"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 rounded bg-[#0F1A24] border border-gray-700 focus:outline-none focus:border-teal-400"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-teal-400 text-black font-semibold py-3 rounded-lg hover:bg-teal-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {isSubmitting ? "Registering..." : "Register as Team Member"}
          </button>
        </form>
      </section>
    </main>
  );
}
