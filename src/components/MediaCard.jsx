import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, Pencil, Video, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchAllMedia } from "../redux/slices/mediaSlice";

export default function MediaCard({ media }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const mediaUrl = media?.url || "";
  const isVideo = mediaUrl.includes("video") || media?.type === "video";

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(media.title || "");
  const [editEventId, setEditEventId] = useState(media.eventId || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(mediaUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [eventsList, setEventsList] = useState([]);

  if (!mediaUrl) return null;

  const fetchAllEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
      // Events API returns { events } or array directly. Let's make it safe:
      setEventsList(response.data?.events || response.data || []);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const handleOpenEdit = async (e) => {
    e.stopPropagation();
    setEditTitle(media.title || "");
    setEditEventId(media.eventId || "");
    setSelectedFile(null);
    setFilePreview(mediaUrl);
    setIsEditing(true);
    await fetchAllEvents();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEventId) {
      toast.warning("Please associate this media with an event");
      return;
    }
    setIsSaving(true);

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("eventId", editEventId);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/media/${media._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data?.message || "Media updated successfully");
      setIsEditing(false);
      dispatch(fetchAllMedia());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update media");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/media/${media._id}`,
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Media deleted successfully");
      dispatch(fetchAllMedia());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete media");
    }
  };

  return (
    <>
      {/* Media Card */}
      <div
        className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer relative group border border-teal-500/10 hover:border-teal-500/30 transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        {isVideo ? (
          <video
            src={mediaUrl}
            className="w-full h-36 object-cover bg-black"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={media.title || "Media"}
            className="w-full h-36 object-cover"
          />
        )}

        {/* Hover details */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-xs truncate font-mono">
            {media.title || "DSC Highlight"}
          </p>
        </div>

        {/* Admin actions overlay */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handleOpenEdit}
              className="p-1.5 bg-teal-400 hover:bg-teal-300 text-black rounded transition shadow cursor-pointer"
              title="Edit Media"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition shadow cursor-pointer"
              title="Delete Media"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {isOpen && !isEditing && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-6 text-white hover:text-teal-400 text-3xl font-bold z-50 cursor-pointer transition"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={media.title || "Media"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            {media.title && (
              <p className="mt-4 text-gray-300 text-sm font-mono tracking-wide bg-[#162330]/80 border border-gray-700 px-4 py-2 rounded-lg">
                {media.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Media Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1A24] border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-teal-400 mb-6">
              Edit Media Item
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Media Preview / Selection */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-teal-500/30 bg-black flex items-center justify-center relative">
                  {filePreview.includes("video") ? (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <label className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded cursor-pointer transition font-mono">
                  Replace Photo / Video File
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Title / Caption</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                />
              </div>

              {/* Associated Event */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Associate with Event</label>
                <select
                  required
                  value={editEventId}
                  onChange={(e) => setEditEventId(e.target.value)}
                  className="w-full p-2.5 rounded bg-black/40 border border-gray-700 text-white focus:outline-none focus:border-teal-400 text-sm"
                >
                  <option value="" disabled className="bg-[#0F1A24]">Select an Event</option>
                  {eventsList.map((evt) => (
                    <option key={evt._id} value={evt._id} className="bg-[#0F1A24] text-white">
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-600 hover:border-gray-500 rounded text-gray-300 font-bold transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-black font-bold rounded transition disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
