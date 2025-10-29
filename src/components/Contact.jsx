import FadeInSection from "./FadeInsection.jsx";
// import clubMap from "../assets/club-map.jpg"; // 👉 add map/location image in src/assets

export default function Contact() {
  return (
    <section id="contact" className="py-20 max-w-6xl bg-white/2 mx-auto px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semiboldbold tracking-tighter text-center md:text-left mb-12">Contact Us</h2>
      </FadeInSection>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Form */}
        <FadeInSection>
          <form className="flex flex-col gap-4  p-6 rounded-xl shadow-lg">
            <input
              type="text"
              placeholder="Your Name"
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="p-3 rounded-lg bg-[#152633] text-white outline-none"
            ></textarea>
            <button className="px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition">
              Send
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
