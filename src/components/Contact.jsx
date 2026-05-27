import FadeInSection from "./FadeInsection.jsx";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const initialFormData = {
  name: "",
  email: "",
  branch: "",
  year: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        formData
      );

      toast.success(response.data?.message || "Your message has been sent successfully!");
      setFormData(initialFormData);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 max-w-6xl mx-auto px-6 text-left">
      <FadeInSection>
        <div className="mb-12">
          <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase mb-3 block">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
            Contact Us
          </h2>
        </div>
      </FadeInSection>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Left Form: Glassmorphic Panel */}
        <div className="md:col-span-6">
          <FadeInSection>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 rounded-3xl border border-gray-800 bg-[#0F1A24]/40 backdrop-blur-md shadow-2xl hover:border-gray-800 transition-all duration-300">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="E.g., CSE"
                    className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="E.g., 3rd"
                    className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider pl-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you're thinking..."
                  rows={4}
                  className="p-3.5 rounded-xl bg-[#0F1A24]/60 border border-gray-800/80 text-white outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all duration-300 placeholder:text-gray-600 text-sm resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl font-bold font-mono uppercase tracking-wider hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 mt-2 cursor-pointer"
              >
                {isSubmitting ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </FadeInSection>
        </div>

        {/* Right Map: Interactive Grayscale-to-Color Panel */}
        <div className="md:col-span-6">
          <FadeInSection>
            <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative group hover:border-teal-500/20 transition-all duration-500">
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0 grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                src="https://maps.google.com/maps?width=600&height=400&hl=en&q=Rajasthan%20Technical%20University&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
