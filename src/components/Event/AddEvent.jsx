import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import FadeInSection from "../FadeInsection";
import EmojiPicker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

export default function AddEventPage() {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    bannerImage: "",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState({ title: false, description: false });

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (eventId) {
      (async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, { withCredentials: true });
          const event = res?.data;
          setFormData({
            title: event.title || "",
            description: event.description || "",
            startDate: event.startDate?.split("T")[0] || "",
            endDate: event.endDate?.split("T")[0] || "",
            location: event.location || "",
            bannerImage: event.bannerImage || ""
          });
        } catch {
          toast.error("Failed to load event details");
        }
      })();
    }
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerImage" && files.length > 0) {
      setFormData({ ...formData, bannerImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEmojiClick = (field, emojiObject) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] + emojiObject.emoji,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));

      const url = eventId
        ? `${import.meta.env.VITE_API_URL}/api/events/${eventId}`
        : `${import.meta.env.VITE_API_URL}/api/events`;

      const method = eventId ? "put" : "post";

      const res = await axios[method](url, form, {
        withCredentials: true,
      });

      toast.success(res.data?.message);
      navigate("/events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 min-h-screen bg-[#0F1A24] text-gray-100">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tight mb-12 text-center text-teal-400">
          {eventId ? "Edit Event" : "Add New Event"}
        </h2>
      </FadeInSection>

      <div className="max-w-2xl mx-auto bg-[#182430] p-8 rounded-2xl shadow-lg border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-gray-300">Event Title</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
              />
              <button
                type="button"
                className="text-2xl"
                onClick={() => setShowEmojiPicker((prev) => ({ ...prev, title: !prev.title }))}
              >
                <FontAwesomeIcon icon={faFaceSmile} />
              </button>
            </div>

            {showEmojiPicker.title && (
              <div className="absolute z-50 mt-2">
                <EmojiPicker onEmojiClick={(emojiObject) => handleEmojiClick("title", emojiObject)} theme="dark" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
            <div className="flex items-start gap-2">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter event description"
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
                rows="4"
              ></textarea>
              <button
                type="button"
                className="text-2xl mt-2"
                onClick={() => setShowEmojiPicker((prev) => ({ ...prev, description: !prev.description }))}
              >
                <FontAwesomeIcon icon={faFaceSmile} />
              </button>
            </div>

            {showEmojiPicker.description && (
              <div className="absolute z-50 mt-2 right-0">
                <EmojiPicker onEmojiClick={(emojiObject) => handleEmojiClick("description", emojiObject)} theme="dark" />
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter location"
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Banner Image</label>
            <input
              type="file"
              name="bannerImage"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 transition-colors text-white font-semibold py-3 rounded-xl shadow-md mt-4"
          >
            {loading ? (eventId ? "Updating..." : "Adding...") : eventId ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>
    </section>
  );
}
