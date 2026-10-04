import React, { useId, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

const defaultSkills = [
  { name: "C & C++", group: "Languages" },
  { name: "Python", group: "Languages" },
  { name: "JavaScript / TypeScript", group: "Languages" },
  { name: "Problem Solving", group: "Core" },
  { name: "Data Structures", group: "Core" },
  { name: "Algorithms", group: "Core" },
  { name: "OOP", group: "Core" },
  { name: "FastAPI & Flask", group: "Frameworks" },
  { name: "React", group: "Frameworks" },
  { name: "Next.js", group: "Frameworks" },
  { name: "PostgreSQL & MySQL", group: "Frameworks" },
];

function getDynamicWideHoneycomb(count, screenWidth) {
  if (count === 0) return [];
  if (count === 1) return [{ col: 0, row: 0 }];

  let hexW = 110;
  if (screenWidth >= 640) hexW = 130;
  if (screenWidth >= 1024) hexW = 150;

  const maxCols = Math.max(1, Math.floor((screenWidth - 40) / hexW));

  let candidates = [];

  // Bruteforce all mathematically valid, continuous hex sequences up to maxCols
  // This completely abandons the "must start at 1" rule and maximizes horizontal width.
  for (let W = 1; W <= maxCols; W++) {
    for (let A = 1; A <= W; A++) {
      for (let B = 1; B <= W; B++) {
        let up = [];
        for (let i = A; i <= W; i++) up.push(i);

        let down = [];
        for (let i = W - 1; i >= B; i--) down.push(i);

        let baseSum =
          up.reduce((x, y) => x + y, 0) + down.reduce((x, y) => x + y, 0);
        if (baseSum > count) continue;

        let rem = count - baseSum;
        let plateau = [];
        let pSum = 0;
        let cur = W - 1;

        while (pSum < rem) {
          if (cur === 0) break;
          plateau.push(cur);
          pSum += cur;
          cur = cur === W ? W - 1 : W;
        }

        if (pSum === rem) {
          let valid = true;
          if (down.length > 0 && plateau.length > 0) {
            let lastP = plateau[plateau.length - 1];
            if (lastP !== W) valid = false; // Must strictly alternate parities
          }
          if (valid) {
            candidates.push([...up, ...plateau, ...down]);
          }
        }
      }
    }
  }

  let bestSeq = null;
  let bestScore = -Infinity;

  for (let seq of candidates) {
    // 1. Maximize width (minimize vertical height)
    let score = -seq.length * 1000;
    // 2. Maximize symmetry (Top and Bottom sizes as identical as possible)
    let sym = Math.abs(seq[0] - seq[seq.length - 1]);
    score -= sym * 100;
    // 3. Prefer wider flat tops/bottoms (e.g. 3, 4, 3 is better than 1, 2, 3, 4, 1)
    score += seq[0] * 10;
    score += seq[seq.length - 1] * 10;

    if (score > bestScore) {
      bestScore = score;
      bestSeq = seq;
    }
  }

  // Fallback for edge cases (should theoretically never hit for real numbers)
  if (!bestSeq) {
    bestSeq = [];
    let rem = count;
    let w = maxCols;
    while (rem > 0) {
      let take = Math.min(rem, w);
      bestSeq.push(take);
      rem -= take;
      w = w === maxCols ? maxCols - 1 : maxCols;
    }
  }

  const pos = [];
  let rowOffset = 0;
  for (let i = 0; i < bestSeq.length; i++) {
    let size = bestSeq[i];
    let isOddParity = i % 2 === 0;
    let cols = [];

    // Strict honeycomb interlocking coordinates
    if (isOddParity) {
      cols.push(0);
      for (let k = 1; k <= Math.floor(size / 2); k++) cols.push(-k, k);
      if (size % 2 === 0) cols.pop();
    } else {
      for (let k = 1; k <= Math.ceil(size / 2); k++)
        cols.push(-(k - 0.5), k - 0.5);
      if (size % 2 !== 0) cols.pop();
    }

    cols.sort((a, b) => {
      const scoreA = Math.abs(a) * 10 + (a > 0 ? 1 : 0);
      const scoreB = Math.abs(b) * 10 + (b > 0 ? 1 : 0);
      return scoreA - scoreB;
    });

    for (let c of cols) {
      pos.push({ col: c, row: rowOffset });
    }
    rowOffset++;
  }

  return pos;
}

const Hexagon = ({ skill, minCol, minRow }) => {
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `hex-grad-${uniqueId}`;

  const shiftedCol = skill.col - minCol;
  const shiftedRow = skill.row - minRow;

  const leftPos = `calc((${shiftedCol} * var(--hex-w)) + (var(--hex-w) / 2))`;
  const topPos = `calc((${shiftedRow} * 0.75 * var(--hex-h)) + (var(--hex-h) / 2))`;

  const colDelay = Math.abs(skill.col) * 0.03 + (skill.col > 0 ? 0.02 : 0);
  const delay = colDelay;

  let colors = {
    from: "#f59e0b",
    to: "#ea580c",
    fill: "bg-amber-500/10",
    hoverFill: "group-hover:bg-amber-500/20",
    textHover: "group-hover:text-amber-500",
  };

  if (skill.group === "Core") {
    colors = {
      from: "#06b6d4",
      to: "#3b82f6",
      fill: "bg-cyan-500/10",
      hoverFill: "group-hover:bg-cyan-500/20",
      textHover: "group-hover:text-cyan-400",
    };
  } else if (skill.group === "Frameworks") {
    colors = {
      from: "#10b981",
      to: "#0d9488",
      fill: "bg-emerald-500/10",
      hoverFill: "group-hover:bg-emerald-500/20",
      textHover: "group-hover:text-emerald-400",
    };
  }

  let gradientCoords = { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };
  if (skill.group === "Languages")
    gradientCoords = { x1: "50%", y1: "100%", x2: "50%", y2: "0%" };
  if (skill.group === "Frameworks")
    gradientCoords = { x1: "100%", y1: "0%", x2: "0%", y2: "100%" };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hover:z-50"
      style={{
        left: leftPos,
        top: topPos,
        width: "var(--hex-w)",
        height: "var(--hex-h)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 0.96 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.35,
          delay: delay,
          type: "spring",
          bounce: 0.3,
        }}
        whileHover={{ scale: 1.05 }}
        className="relative w-full h-full group flex items-center justify-center"
      >
        <div
          className="absolute inset-[2px] transition-colors duration-300"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: "var(--card-bg)",
          }}
        />
        <div
          className={`absolute inset-[2px] ${colors.fill} ${colors.hoverFill} transition-colors duration-300`}
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} {...gradientCoords}>
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>

          <motion.path
            d="M 50 0 L 100 25 L 100 75 L 50 100 L 0 75 L 0 25 Z"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.35,
              delay: delay + 0.05,
              ease: "easeOut",
            }}
          />

          <path
            d="M 50 0 L 100 25 L 100 75 L 50 100 L 0 75 L 0 25 Z"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </svg>

        <div
          className="relative z-10 p-3 md:p-5 text-center flex items-center justify-center pointer-events-none w-full h-full"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        >
          <h3
            className={`text-xs md:text-sm font-bold font-heading text-balance text-[var(--global-text)] ${colors.textHover} transition-colors duration-300 leading-tight`}
          >
            {skill.name}
          </h3>
        </div>
      </motion.div>
    </div>
  );
};

const Skills = () => {
  const [hexData, setHexData] = useState([]);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenWidth === 0) return;

    const skillsRef = ref(database, "skills");
    const unsubscribe = onValue(skillsRef, (snapshot) => {
      const data = snapshot.val();
      let rawSkills = data
        ? Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        : [...defaultSkills];

      const grouped = {
        Languages: rawSkills.filter((s) => s.group === "Languages"),
        Core: rawSkills.filter((s) => s.group === "Core"),
        Frameworks: rawSkills.filter((s) => s.group === "Frameworks"),
      };

      const sortedSkills = [
        ...grouped["Languages"],
        ...grouped["Core"],
        ...grouped["Frameworks"],
      ];

      const positions = getDynamicWideHoneycomb(
        sortedSkills.length,
        screenWidth,
      );

      const positionedSkills = sortedSkills.map((skill, index) => {
        return {
          ...skill,
          col: positions[index].col,
          row: positions[index].row,
        };
      });

      setHexData(positionedSkills);
    });
    return () => unsubscribe();
  }, [screenWidth]);

  const minCol =
    hexData.length > 0 ? Math.min(...hexData.map((s) => s.col)) : 0;
  const maxCol =
    hexData.length > 0 ? Math.max(...hexData.map((s) => s.col)) : 0;
  const minRow =
    hexData.length > 0 ? Math.min(...hexData.map((s) => s.row)) : 0;
  const maxRow =
    hexData.length > 0 ? Math.max(...hexData.map((s) => s.row)) : 0;

  return (
    <section
      id="skills"
      className="w-full pt-[80px] md:pt-[100px] pb-24 relative bg-surface/20 flex flex-col scroll-mt-0 min-h-[100dvh]"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-20 shrink-0 mt-4 md:mt-8 mb-12 pointer-events-none px-4"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 italic">
          Technical Arsenal
        </h2>
        <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full shadow-[0_0_15px_var(--primary)]"></div>
      </motion.div>

      <div className="w-full flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar px-2 sm:px-4 pb-12 flex justify-center items-start md:items-center">
        <div
          className="relative honeycomb-cluster mx-auto transition-all duration-500 ease-in-out mt-8 md:mt-0"
          style={{
            width: `calc((${maxCol - minCol + 1}) * var(--hex-w) + 20px)`,
            height: `calc((${maxRow - minRow} * 0.75 * var(--hex-h)) + var(--hex-h) + 40px)`,
            minWidth: `calc((${maxCol - minCol + 1}) * var(--hex-w) + 20px)`,
          }}
        >
          <style>
            {`
              .honeycomb-cluster {
                --hex-w: 110px;
                --hex-h: calc(var(--hex-w) / 0.866);
              }
              @media (min-width: 640px) {
                .honeycomb-cluster { --hex-w: 130px; }
              }
              @media (min-width: 1024px) {
                .honeycomb-cluster { --hex-w: 150px; }
              }
            `}
          </style>

          {hexData.map((skill) => (
            <Hexagon
              key={skill.id}
              skill={skill}
              minCol={minCol}
              minRow={minRow}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
