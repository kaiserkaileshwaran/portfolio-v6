import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import Magnetic from "./Magnetic";

const themes = [
  { id: "sunrise", icon: <Sunrise size={18} />, label: "Initialize" },
  { id: "day", icon: <Sun size={18} />, label: "Execute" },
  { id: "sunset", icon: <Sunset size={18} />, label: "Compile" },
  { id: "night", icon: <Moon size={18} />, label: "Deploy" },
];

const Header = ({ isVisible = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    let savedTheme = sessionStorage.getItem("themeOverride");
    if (!savedTheme) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 9) savedTheme = "sunrise";
      else if (hour >= 9 && hour < 17) savedTheme = "day";
      else if (hour >= 17 && hour < 20) savedTheme = "sunset";
      else savedTheme = "night";
    }
    return savedTheme;
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", currentTheme);
    localStorage.setItem("appTheme", currentTheme);
    window.dispatchEvent(
      new CustomEvent("theme-changed", { detail: currentTheme }),
    );
  }, [currentTheme]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "appTheme" && e.newValue) {
        setCurrentTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "History", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Wait for mobile menu to unmount before calculating and scrolling
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        const offset = href === "#experience" || href === "#skills" ? 0 : 80;
        const elementPosition =
          target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -50,
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isScrolled ? "theme-card mx-6 mt-6 py-4 px-8" : "bg-transparent py-6"} ${!isVisible && "pointer-events-none"}`}
    >
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 h-screen w-screen bg-black/5 backdrop-blur-[2px] z-[-1] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 flex justify-between items-center relative z-10">
        <a
          href="#"
          onClick={(e) => handleNavClick(e, "#top")}
          className="flex items-center"
        >
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shadow-sm border border-[var(--global-text)] hover:scale-105 transition-transform"
          />
        </a>

        <nav className="hidden lg:flex gap-5 md:p-8 items-center">
          {navLinks.map((link) => (
            <Magnetic key={link.name}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-force hover: transition-colors font-medium text-sm tracking-wide"
              >
                {link.name}
              </a>
            </Magnetic>
          ))}

          <div className="flex bg-black/10 dark:bg-white/10 rounded-full p-1 border border-textMain/10 ml-4 backdrop-blur-md">
            {themes.map((theme) => (
              <Magnetic key={theme.id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentTheme !== theme.id) {
                      sessionStorage.setItem("themeOverride", theme.id);
                      window.location.reload();
                    }
                  }}
                  title={theme.label}
                  className={`p-2 rounded-full transition-colors ${currentTheme === theme.id ? "theme-active-btn" : "text-muted-force hover:"}`}
                >
                  {theme.icon}
                </button>
              </Magnetic>
            ))}
          </div>
        </nav>

        <button
          className="lg:hidden relative w-8 h-8 flex items-center justify-center focus:outline-none text-[var(--global-text)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <motion.div
            initial={false}
            animate={{
              rotate: mobileMenuOpen ? 180 : 0,
              opacity: mobileMenuOpen ? 0 : 1,
              scale: mobileMenuOpen ? 0.5 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <Menu size={28} />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              rotate: mobileMenuOpen ? 0 : -180,
              opacity: mobileMenuOpen ? 1 : 0,
              scale: mobileMenuOpen ? 1 : 0.5,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <X size={28} />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden theme-card p-5 md:p-8 absolute top-full left-0 right-0 overflow-hidden shadow-2xl border-t border-[var(--global-text)]/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className=" text-lg font-medium"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex bg-surface/50 rounded-full p-1 border border-textMain/10 w-fit mt-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentTheme !== theme.id) {
                        sessionStorage.setItem("themeOverride", theme.id);
                        window.location.reload();
                      }
                    }}
                    title={theme.label}
                    className={`p-2 rounded-full transition-colors flex items-center gap-2 ${currentTheme === theme.id ? "theme-active-btn " : "text-muted-force hover:"}`}
                  >
                    {theme.icon}
                  </button>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
