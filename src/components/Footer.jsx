import { Github, Linkedin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F1A24] py-10 text-center text-gray-500 border-t border-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 px-6">
        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium">
          <a href="#home" className="hover:text-teal-400 transition">Home</a>
          <a href="#about" className="hover:text-teal-400 transition">About</a>
          <a href="#events" className="hover:text-teal-400 transition">Events</a>
          <a href="#team" className="hover:text-teal-400 transition">Team</a>
          <a href="#gallery" className="hover:text-teal-400 transition">Gallery</a>
          <a href="#contact" className="hover:text-teal-400 transition">Contact</a>
        </nav>

        {/* Social Media Icons */}
        <div className="flex gap-6 text-xl">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Github className="w-6 h-6 hover:text-teal-400 transition" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Linkedin className="w-6 h-6 hover:text-teal-400 transition" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram className="w-6 h-6 hover:text-teal-400 transition" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <Twitter className="w-6 h-6 hover:text-teal-400 transition" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Developer Students Club. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
