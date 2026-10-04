import React from "react";
import { motion } from "framer-motion";

const educations = [
  {
    degree: "B.E. (Computer Science)",
    institution: "Kongu Engineering College",
    period: "2020 - 2024",
    icon: "images/education.png",
  },
  {
    degree: "Diploma (Mechatronics)",
    institution: "Kongu Polytechnic College",
    period: "2018 - 2020",
    description:
      "Developed strong foundational knowledge in mechanical, electronics, and control systems, bridging the gap between hardware and software.",
    icon: "images/education1.png",
  },
];

const Education = () => {
  return (
    <section id="education" className="py-24 relative bg-surface/30">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">Education</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {educations.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                type: "tween",
                ease: "easeOut",
              }}
            >
              <div className="theme-card hover:-translate-y-2 transition-transform duration-300 p-5 md:p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4 pl-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white mb-1">
                      {edu.degree}
                    </h3>
                    <p className="font-medium text-primary text-base lg:text-lg">
                      {edu.institution}
                    </p>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-muted-force whitespace-nowrap self-start lg:self-auto">
                    {edu.period}
                  </div>
                </div>

                <p className="text-muted-force text-base lg:text-lg leading-relaxed pl-4 flex-grow">
                  {edu.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
