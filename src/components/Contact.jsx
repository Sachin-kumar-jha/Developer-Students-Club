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
    <section id="contact" className="py-20 max-w-6xl bg-white/2 mx-auto px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semiboldbold tracking-tighter text-center md:text-left mb-12">Contact Us</h2>
      </FadeInSection>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Form */}
        <FadeInSection>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 rounded-xl shadow-lg">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Your Branch"
                className="p-3 rounded-lg bg-[#152633] text-white outline-none"
                required
              />
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Your Year"
                className="p-3 rounded-lg bg-[#152633] text-white outline-none"
                required
              />
            </div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={5}
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        </FadeInSection>

        {/* Right Image / Location */}
        <FadeInSection>
          <div className="relative w-full pb-[66.67%]">
  <iframe
    className="absolute top-0 left-0 w-full h-full border-0"
    src="https://maps.google.com/maps?width=600&height=400&hl=en&q=Rajasthan%20Technical%20University&t=&z=14&ie=UTF8&iwloc=B&output=embed"
    allowFullScreen=""
    loading="lazy"
  ></iframe>
</div>
        </FadeInSection>
      </div>
    </section>
  );
}
