import React from "react";
import { motion } from "framer-motion";
import { Bike, Headphones, Palette, Waves } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">About Me</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full shadow-[0_0_15px_var(--primary)]"></div>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-5 relative group"
          >
            <div className="relative rounded-2xl overflow-hidden theme-card p-4 transition-all duration-500 group-hover:border-primary/50">
              <img
                src="images/avatar.png"
                alt="Kailesh"
                className="w-full h-auto rounded-xl filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 border-4 border-primary/30 rounded-2xl transition-all duration-[800ms] ease-in-out translate-x-0 translate-y-0 scale-100 group-hover:translate-x-4 group-hover:translate-y-4 group-hover:scale-110 group-hover:border-primary/60"></div>
            <div className="absolute -z-10 -top-6 -left-6 w-32 h-32 border-4 border-secondary/30 rounded-2xl transition-all duration-[800ms] ease-in-out translate-x-0 translate-y-0 scale-100 group-hover:-translate-x-4 group-hover:-translate-y-4 group-hover:scale-110 group-hover:border-secondary/60"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-7"
          >
            <h3 className="text-3xl font-heading font-bold mb-6 tracking-tight">
              Hello! I'm Kailesh.
            </h3>
            <p className="text-muted-force text-base md:text-lg leading-relaxed mb-10">
              I am driven by a passion for tackling real-world challenges using
              mathematical principles. Proficient in algorithms and data
              structures, I bring a unique blend of analytical thinking and
              creative problem-solving to every project. A quick learner and
              collaborative team player, I thrive in challenging environments
              and am committed to delivering results.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-5 theme-card p-6 rounded-2xl hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_var(--primary)] transition-all">
                  <Bike
                    size={26}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--global-text)]">
                    Cycling
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 theme-card p-6 rounded-2xl hover:-translate-y-1.5 hover:shadow-xl hover:shadow-secondary/10 hover:border-secondary/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:bg-secondary/20 group-hover:shadow-[0_0_20px_var(--secondary)] transition-all">
                  <Headphones
                    size={26}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--global-text)]">
                    Listening Music
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 theme-card p-6 rounded-2xl hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:bg-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
                  <Palette
                    size={26}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--global-text)]">
                    Art
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 theme-card p-6 rounded-2xl hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                  <Waves
                    size={26}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--global-text)]">
                    Swimming
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
