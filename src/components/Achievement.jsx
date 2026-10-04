import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

const achievements = [
  {
    title: "Robotics",
    issuer: "Techanalogy",
    year: "2023",
    desc: "A 45 Days virtual workshop.",
    link: "Docs/Robotron.pdf",
  },
  {
    title: "CS50 Scratch",
    issuer: "Harvard University",
    year: "2023",
    desc: "Logic basics, Programming.",
    link: "Docs/Scratch.pdf",
  },
  {
    title: "CS50 Technology",
    issuer: "Harvard University",
    year: "2023",
    desc: "Tech Understanding, Core Concepts.",
    link: "Docs/Technology.pdf",
  },
  {
    title: "CS50 Python",
    issuer: "Harvard University",
    year: "2024",
    desc: "Core Programming Concepts.",
    link: "Docs/CS50 Python.pdf",
  },
];

const Achievement = () => {
  return (
    <section id="achievement" className="py-24 relative bg-surface/50">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold  mb-4">
            Achievements & Certifications
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((ach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="theme-card p-5 md:p-8 rounded-2xl border-t-2 border-t-primary/50 hover:border-t-primary transition-colors flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Award size={20} />
                  </div>
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                    {ach.year}
                  </span>
                </div>

                <h3 className="text-lg font-bold  mb-1">{ach.title}</h3>
                <p className="text-sm text-primary mb-3">{ach.issuer}</p>
                <p className="text-sm text-muted-force mb-6 flex-grow">
                  {ach.desc}
                </p>

                <a
                  href={ach.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold  hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  View Certificate <span className="text-primary">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievement;
