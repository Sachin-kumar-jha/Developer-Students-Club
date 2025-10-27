import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import FadeInSection from "../FadeInsection.jsx";
import UploadOverlay from "../Skeleton/UploadOverlay.jsx";
import EventMediaForm from "../EventMediaForm.jsx";

export default function EventMediaUpload() {
  const { eventId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { events } = useSelector((state) => state.events);
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isAdmin = user?.role === "admin";
  useEffect(() => {
    if (!isAdmin) navigate("/events");
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (events && events.length > 0) {
      const selectedEvent = events.find((event) => event._id === eventId);
      if (selectedEvent) {
        setEventTitle(selectedEvent.title);
      } else {
        toast.error("Event not found!");
        navigate("/events");
      }
    }
  }, [events, eventId, navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.warning("Select at least one file!");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("title", eventTitle);

    setUploading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/media/${eventId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total)),
        }
      );
      toast.success("🎉 Media uploaded successfully!");
      setFiles([]);
      navigate("/events");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <section className="relative py-20 px-6 min-h-screen bg-[#0F1A24] text-gray-100">
      {uploading && <UploadOverlay progress={progress} />}

      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tight mb-12 text-center text-teal-400">
          Upload Media for Event
        </h2>
      </FadeInSection>

      <div className="max-w-xl mx-auto bg-[#182430] p-8 rounded-2xl shadow-lg border border-gray-700 relative z-10">
        <EventMediaForm
          eventTitle={eventTitle}
          files={files}
          setFiles={setFiles}
          uploading={uploading}
          handleUpload={handleUpload}
        />
      </div>
    </section>
  );
}
