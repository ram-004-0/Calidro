import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Lightweight icons

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "home", href: "#home", type: "anchor" },
    { name: "gallery", href: "#gallery", type: "anchor" },
    { name: "book", href: "#book", type: "anchor" },
    { name: "contact", href: "#contact", type: "anchor" },
  ];

  const linkStyle =
    "block rounded-2xl px-3 py-2 text-base hover:bg-white/5 hover:text-white-600 transition-colors uppercase font-medium";

  return (
    <nav className="sticky top-0 z-20 w-full bg-[#433633] text-[#f4dfba] p-2">
      {/* Desktop & Mobile Header Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 items-center w-full">
        {/* Logo */}
        <h2 className="flex ml-5 md:mx-20 text-4xl md:text-5xl font-imperialscript">
          Calidro
        </h2>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden md:flex space-x-8 justify-around py-5">
          <Link to="/login" className={linkStyle}>
            Login
          </Link>
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className={linkStyle}>
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button (Hidden on Desktop) */}
        <div className="md:hidden flex justify-end mr-5">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#433633] px-5 pb-5 space-y-2 border-t border-white/10">
          <Link
            to="/login"
            className={linkStyle}
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={linkStyle}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
