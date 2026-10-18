import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import FadeInSection from "../FadeInsection";
import EmojiPicker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

// Helper to extract local date (YYYY-MM-DD) and time (HH:mm) from ISO string or Date
const parseDateTime = (isoString) => {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
};

// Helper to combine local date (YYYY-MM-DD) and time (HH:mm) into an ISO string
const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  if (isNaN(localDate.getTime())) return "";
  return localDate.toISOString();
};

export default function AddEventPage() {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "18:00",
    location: "",
    fee: "",
    upiId: "",
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
          const start = parseDateTime(event.startDate);
          const end = parseDateTime(event.endDate);

          setFormData({
            title: event.title || "",
            description: event.description || "",
            startDate: start.date,
            startTime: start.time || "10:00",
            endDate: end.date,
            endTime: end.time || "18:00",
            location: event.location || "",
            fee: event.fee || "",
            upiId: event.upiId || "",
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
    if (name === "bannerImage" && files && files.length > 0) {
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
      const finalStartDate = combineDateTime(formData.startDate, formData.startTime);
      const finalEndDate = combineDateTime(formData.endDate, formData.endTime);

      if (finalStartDate && finalEndDate && new Date(finalEndDate) < new Date(finalStartDate)) {
        toast.error("End date & time cannot be before start date & time");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("startDate", finalStartDate);
      form.append("endDate", finalEndDate);
      form.append("location", formData.location);
      form.append("fee", formData.fee || 0);
      form.append("upiId", formData.upiId || "");
      if (formData.bannerImage) {
        form.append("bannerImage", formData.bannerImage);
      }

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

          {/* Start Date & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none text-white [color-scheme:dark]"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none text-white [color-scheme:dark]"
              />
            </div>
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

          {/* Fee & UPI */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Event Fee</label>
              <input
                type="number"
                name="fee"
                min="0"
                value={formData.fee}
                onChange={handleChange}
                placeholder="0 for free event"
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="club@upi"
                className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Banner Image</label>
            {typeof formData.bannerImage === "string" && formData.bannerImage && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Current Image Preview:</p>
                <img
                  src={formData.bannerImage}
                  alt="Banner Preview"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-700"
                />
              </div>
            )}
            <input
              type="file"
              name="bannerImage"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-600 focus:ring-2 focus:ring-teal-400 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 transition-colors text-white font-semibold py-3 rounded-xl shadow-md mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (eventId ? "Updating..." : "Adding...") : eventId ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>
    </section>
  );
}
