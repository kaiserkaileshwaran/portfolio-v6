import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

const defaultData = [
  {
    role: "Diploma in Mechatronics",
    company: "Kongu Polytechnic",
    period: "2018-20",
  },
  { role: "Project Technician", company: "IITM, Chennai", period: "2021" },
  {
    role: "B.E. Computer Science",
    company: "Kongu Eng. College",
    period: "2020-24",
  },
  { role: "Robotics", company: "Techanalogy", period: "2023" },
  { role: "CS50 Scratch", company: "Harvard", period: "2023" },
  { role: "CS50 Tech", company: "Harvard", period: "2023" },
  { role: "CS50 Python", company: "Harvard", period: "2024" },
  { role: "SDE Intern", company: "Pentafox Tech", period: "2025" },
  {
    role: "Freelance Software Engineer",
    company: "Self-Employed",
    period: "2025-Present",
  },
];

const Experience = () => {
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(triggerRef, {
    once: true,
    margin: "0px 0px -20px 0px",
  });

  const [timeline, setTimeline] = useState([]);
  const [arrow, setArrow] = useState({ x: 90, y: 10 });
  const [sourceData, setSourceData] = useState([]);

  useEffect(() => {
    const historyRef = ref(database, "history");
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSourceData(
          Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
        );
      } else {
        // Fallback to default if empty
        setSourceData(
          defaultData.map((d, i) => ({ id: `default-${i}`, ...d })),
        );
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (sourceData.length === 0) return;

    const calculateLayout = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;

      let minX = 25;
      let maxX = 75;

      if (isMobile) {
        minX = 35;
        maxX = 65;
      } else if (width < 1024) {
        minX = 15;
        maxX = 85;
      } else {
        minX = 10;
        maxX = 90;
      }

      const startY = 88;
      const endY = 18;
      const spanY = startY - endY;

      const newTimeline = sourceData.map((item, i) => {
        const progress =
          sourceData.length > 1 ? i / (sourceData.length - 1) : 0;
        const x = minX + progress * (maxX - minX);
        const baseY = startY - progress * spanY;

        // Dynamically assign left/right alternating for mobile
        const side = i % 2 === 0 ? "left" : "right";
        const yOffset = isMobile
          ? side === "left"
            ? -2.5
            : 2.5
          : i % 2 === 0
            ? 3
            : -3;
        const y = baseY + yOffset;

        return {
          ...item,
          x,
          y,
          anchor: i % 2 === 0 ? "top" : "bottom",
          side,
          layoutType: isMobile ? "side" : "vertical",
        };
      });

      setTimeline(newTimeline);
      if (newTimeline.length > 0) {
        const lastNode = newTimeline[newTimeline.length - 1];
        setArrow({ x: lastNode.x, y: lastNode.y });
      }
    };

    calculateLayout();
    window.addEventListener("resize", calculateLayout);
    return () => window.removeEventListener("resize", calculateLayout);
  }, [sourceData]);

  // Generate smooth cubic bezier curve
  const generatePath = () => {
    if (timeline.length === 0) return { strokeD: "", areaD: "" };
    let strokeD = `M ${timeline[0].x} ${timeline[0].y}`;
    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1];
      const curr = timeline[i];
      const midX = (prev.x + curr.x) / 2;
      strokeD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Create the area fill path by closing the stroke path down to bottom right
    const areaD = `${strokeD} L ${timeline[timeline.length - 1].x} 100 L ${timeline[0].x} 100 Z`;
    return { strokeD, areaD };
  };

  const { strokeD, areaD } = generatePath();

  return (
    <section
      id="experience"
      ref={triggerRef}
      className="w-full relative py-24 min-h-[100dvh] flex flex-col justify-center overflow-hidden scroll-mt-0"
    >
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-surface/30 z-0" />

      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto relative z-10 px-4 sm:px-6 h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 shrink-0 relative z-20 pointer-events-none"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2 md:mb-4 italic">
            History
          </h2>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full shadow-[0_0_15px_var(--primary)]"></div>
        </motion.div>

        <div
          className="relative flex-grow min-h-[500px] md:min-h-[600px] w-full"
          ref={containerRef}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity="0.15"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity="0.0"
                />
              </linearGradient>

              <linearGradient id="line-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity="0.2"
                />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor="var(--secondary)"
                  stopOpacity="1"
                />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* X and Y Axes */}
            <motion.path
              d="M 10 10 L 10 90 L 90 90"
              fill="none"
              stroke="var(--global-text)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: 0.8 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 1.0, ease: "easeOut" }}
            />

            {/* HTML Overlay Axis Labels placed outside SVG to prevent stretching */}
            {/* Area Chart Fill */}
            {areaD && (
              <motion.path
                d={areaD}
                fill="url(#area-gradient)"
                stroke="none"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1.0, delay: 1.5 }}
              />
            )}

            {/* Graph Line */}
            {strokeD && (
              <motion.path
                d={strokeD}
                fill="none"
                stroke="var(--global-text)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  isInView
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
              />
            )}

            {/* Sharp Arrowhead pointing UP and RIGHT */}
            {timeline.length > 0 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
                }
                transition={{ duration: 0.2, delay: 2.1 }}
                style={{ transformOrigin: `${arrow.x}px ${arrow.y}px` }}
              >
                <path
                  d="M -1.5 1.5 L 0 0 L -1.5 -1.5"
                  fill="none"
                  stroke="var(--global-text)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform={`translate(${arrow.x}, ${arrow.y}) rotate(-50)`}
                  filter="url(#glow)"
                />
              </motion.g>
            )}
          </svg>
          {/* Unstretched HTML Axis Labels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.8 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute bottom-[4%] right-[8%] md:bottom-[6%] md:right-[10%] text-textMain font-bold text-xl md:text-2xl tracking-wide pointer-events-none drop-shadow-md"
          >
            Time
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.8 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute top-[8%] left-[2%] md:top-[12%] md:left-[6%] text-textMain font-bold text-xl md:text-2xl tracking-wide pointer-events-none drop-shadow-md -rotate-90 origin-left"
          >
            Growth
          </motion.div>

          {/* Render Logic specific to Device */}
          {timeline.map((exp, index) => {
            return (
              <div
                key={exp.id}
                className="absolute z-20"
                style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
              >
                {/* Node Dot */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0, opacity: 0 }
                  }
                  transition={{
                    duration: 0.4,
                    delay: 1.5 + index * 0.1,
                    type: "spring",
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-primary border-[1px] border-bg shadow-[0_0_8px_var(--primary)] z-10" />
                  <div className="absolute w-3 h-3 md:w-5 md:h-5 rounded-full border border-primary animate-ping opacity-30" />
                </motion.div>

                {exp.layoutType === "side" ? (
                  /* MOBILE: Left and Right Layout */
                  <>
                    {exp.side === "left" && (
                      <motion.div
                        initial={{ opacity: 0, x: -15 }}
                        animate={
                          isInView
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -15 }
                        }
                        transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center"
                      >
                        <div className="theme-card hover:-translate-x-1 transition-transform duration-300 p-2 md:p-3 rounded-lg shadow-xl border border-primary/20 backdrop-blur-md flex flex-col justify-center items-center text-center group bg-surface/95 w-[115px] sm:w-[130px]">
                          <h3 className="text-[10px] sm:text-[11px] font-bold leading-tight mb-1 text-balance">
                            {exp.role}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-primary font-semibold mb-1 text-balance">
                            {exp.company}
                          </p>
                          <div className="text-[7px] sm:text-[8px] text-muted-force bg-white/5 px-1.5 py-0.5 rounded-full border border-white/10 w-max mx-auto">
                            {exp.period}
                          </div>
                        </div>
                        <div className="h-[2px] w-2 md:w-4 bg-gradient-to-l from-primary to-primary/0 rounded-full" />
                      </motion.div>
                    )}
                    {exp.side === "right" && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={
                          isInView
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: 15 }
                        }
                        transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex items-center"
                      >
                        <div className="h-[2px] w-2 md:w-4 bg-gradient-to-r from-primary to-primary/0 rounded-full" />
                        <div className="theme-card hover:translate-x-1 transition-transform duration-300 p-2 md:p-3 rounded-lg shadow-xl border border-primary/20 backdrop-blur-md flex flex-col justify-center items-center text-center group bg-surface/95 w-[115px] sm:w-[130px]">
                          <h3 className="text-[10px] sm:text-[11px] font-bold leading-tight mb-1 text-balance">
                            {exp.role}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-primary font-semibold mb-1 text-balance">
                            {exp.company}
                          </p>
                          <div className="text-[7px] sm:text-[8px] text-muted-force bg-white/5 px-1.5 py-0.5 rounded-full border border-white/10 w-max mx-auto">
                            {exp.period}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  /* DESKTOP: Top and Bottom Layout */
                  <motion.div
                    initial={{ opacity: 0, y: exp.anchor === "top" ? 15 : -15 }}
                    animate={
                      isInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: exp.anchor === "top" ? 15 : -15 }
                    }
                    transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                    className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${
                      exp.anchor === "top"
                        ? "bottom-2 flex-col"
                        : "top-2 flex-col-reverse"
                    }`}
                  >
                    {/* The Card */}
                    <div
                      className={`theme-card transition-transform duration-300 p-2 md:p-3 rounded-lg shadow-xl border border-primary/20 backdrop-blur-md flex flex-col justify-center items-center text-center group bg-surface/95 w-max min-w-[140px] max-w-[160px] ${
                        exp.anchor === "top"
                          ? "hover:-translate-y-1 mb-0.5"
                          : "hover:translate-y-1 mt-0.5"
                      } ${
                        index === 0
                          ? "translate-x-[15%]"
                          : index === timeline.length - 1
                            ? "-translate-x-[45%]"
                            : exp.anchor === "top"
                              ? "-translate-x-[35%]"
                              : "translate-x-[35%]"
                      }`}
                    >
                      <h3 className="text-xs md:text-sm font-bold leading-tight mb-1 text-balance">
                        {exp.role}
                      </h3>
                      <p className="text-[11px] md:text-xs text-primary font-semibold mb-1 text-balance">
                        {exp.company}
                      </p>
                      <div className="text-[9px] md:text-[10px] text-muted-force bg-white/5 px-2 py-0.5 rounded-full border border-white/10 w-max mx-auto">
                        {exp.period}
                      </div>
                    </div>
                    {/* Micro-Stem */}
                    <div
                      className={`w-[2px] h-3 md:h-5 ${
                        exp.anchor === "top"
                          ? "bg-gradient-to-t from-primary to-primary/0"
                          : "bg-gradient-to-b from-primary to-primary/0"
                      }`}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
