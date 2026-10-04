import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ThreeDObject from "./components/ThreeDObject";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppBtn from "./components/WhatsAppBtn";
import Admin from "./components/Admin";
import "./firebase";

function MainApp() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    const timerIntro = setTimeout(() => {
      setIntroComplete(true);
      document.body.style.overflow = "unset";
    }, 3300);

    return () => {
      clearTimeout(timerIntro);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-50]">
        <ThreeDObject />
      </div>

      <Header isVisible={introComplete} />

      <AnimatePresence>
        {introComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <main>
              <Hero />
              <About />
              <Skills />
              <Experience />
              <Projects />
              <Contact />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      <WhatsAppBtn isVisible={introComplete} />
    </>
  );
}

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === "/admin",
  );

  useEffect(() => {
    // Determine initial theme
    let savedTheme = sessionStorage.getItem("themeOverride");
    if (savedTheme) {
      sessionStorage.removeItem("themeOverride");
    } else {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 9) savedTheme = "sunrise";
      else if (hour >= 9 && hour < 17) savedTheme = "day";
      else if (hour >= 17 && hour < 20) savedTheme = "sunset";
      else savedTheme = "night";
    }
    localStorage.setItem("appTheme", savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    // Sync theme if changed in another tab (e.g. main site vs admin site)
    const handleStorage = (e) => {
      if (e.key === "appTheme" && e.newValue) {
        document.body.setAttribute("data-theme", e.newValue);
      }
    };

    // Listen to custom event for same-tab updates (when Header changes theme)
    const handleLocalThemeChange = (e) => {
      document.body.setAttribute("data-theme", e.detail);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("theme-changed", handleLocalThemeChange);

    const onLocationChange = () =>
      setIsAdminRoute(window.location.pathname === "/admin");
    window.addEventListener("popstate", onLocationChange);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("theme-changed", handleLocalThemeChange);
    };
  }, []);

  return (
    <div className="relative selection:bg-textMain selection:text-bg-2 min-h-screen font-sans overflow-hidden text-[var(--global-text)]">
      {/* Global Background Engine - available everywhere */}
      <div className="fixed inset-0 z-[-100] pointer-events-none">
        <div className="bg-layer bg-default"></div>
        <div className="bg-layer sunrise-bg"></div>
        <div className="bg-layer day-bg"></div>
        <div className="bg-layer sunset-bg"></div>
        <div className="bg-layer night-bg"></div>
      </div>

      {isAdminRoute ? <Admin /> : <MainApp />}
    </div>
  );
}

export default App;
