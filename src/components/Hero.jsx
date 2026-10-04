import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden"
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 relative z-10 w-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 3.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 3.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block px-4 py-2 rounded-full border border-[var(--global-text)] backdrop-blur-md mb-6 md:mb-8"
          >
            <p className="font-medium text-xs md:text-sm tracking-widest uppercase">
              Freelance Software Developer
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 3.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading leading-[1.1] tracking-tight mb-6 md:mb-8 font-bold"
            style={{
              textShadow:
                "0 2px 20px var(--global-bg), 0 2px 40px var(--global-bg), 0 0 20px var(--hero-glow), 0 0 40px var(--hero-glow)",
            }}
          >
            Kaileshwaran P.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 max-w-2xl leading-relaxed font-light"
            style={{
              textShadow:
                "0 0 10px var(--hero-glow), 0 0 20px var(--hero-glow)",
            }}
          >
            Engineering elegant, highly-scalable software architecture. A
            passionate freelance developer dedicated to crafting the future of
            human-computer interaction through modern technologies and
            innovative problem-solving.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 3.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4 md:gap-6 items-center pointer-events-auto"
          >
            <a
              href="#contact"
              className="px-6 py-3 md:px-8 md:py-4 rounded-full hover:scale-105 font-bold flex items-center gap-3 transition-transform text-base md:text-lg shadow-2xl"
              style={{
                backgroundColor: "var(--global-text)",
                color: "var(--card-bg)",
              }}
            >
              Collaborate <ArrowRight size={20} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
