import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Play, Briefcase, User } from "lucide-react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

// Helper component to render icons based on project links
const ProjectIcon = ({ link, demoLink, size = "card", title }) => {
  const finalLink = link || demoLink || "";
  const iconClass =
    size === "card"
      ? "w-10 h-10 md:w-12 md:h-12 text-primary mb-4"
      : "w-16 h-16 md:w-20 md:h-20 text-primary mb-6";

  let domain = "";
  try {
    domain = new URL(finalLink).hostname;
  } catch {
    domain = "";
  }

  const [imgAttempt, setImgAttempt] = useState(0);

  const fallbackText = title
    ? encodeURIComponent(
        title
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 2)
          .toUpperCase(),
      )
    : "PR";
  const uiAvatar = `https://ui-avatars.com/api/?name=${fallbackText}&background=0284c7&color=fff&size=128&bold=true&rounded=true`;

  if (!domain || imgAttempt > 3) {
    return (
      <img
        src={uiAvatar}
        alt={title || "Project"}
        className={`${iconClass} object-contain rounded-xl`}
      />
    );
  }

  const sources = [
    // 1. Live favicon fetcher (most reliable for unindexed/freelance sites)
    `https://icon.horse/icon/${domain}`,
    // 2. Google's high-res favicon cache
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // 3. DuckDuckGo favicon service
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    // 4. Fallback initials
    uiAvatar,
  ];

  return (
    <img
      src={sources[imgAttempt]}
      alt="Favicon"
      className={`${iconClass} object-contain rounded-xl bg-white/5`}
      onError={() => setImgAttempt((prev) => prev + 1)}
    />
  );
};

const Projects = () => {
  const [activeTab, setActiveTab] = useState("freelance");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsRef = ref(database, "projects");
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsedProjects = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setProjects(parsedProjects);
      } else {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Safely determine if a project belongs to freelance or personal based on new type OR legacy booleans
  const isFreelance = (p) =>
    p.type === "freelance" ||
    p.isFreelance === true ||
    (p.isFreelance !== false && !p.isPersonal && p.type !== "personal");
  const isPersonal = (p) =>
    p.type === "personal" || p.isPersonal === true || p.isFreelance === false;

  const displayProjects =
    activeTab === "freelance"
      ? projects.filter(isFreelance)
      : projects.filter(isPersonal);

  const renderLayout = () => {
    let layoutContent = null;

    if (displayProjects.length === 0) {
      layoutContent = (
        <div className="text-center py-20 text-muted-force bg-surface/30 rounded-3xl border border-textMain/10">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects found in this category.</p>
        </div>
      );
    } else if (displayProjects.length <= 2) {
      layoutContent = (
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-4xl mx-auto relative z-10">
          {displayProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
              className={
                displayProjects.length === 1
                  ? "w-full md:max-w-md mx-auto"
                  : "w-full md:w-1/2"
              }
            />
          ))}
        </div>
      );
    } else {
      layoutContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {displayProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      );
    }

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {layoutContent}
      </motion.div>
    );
  };

  return (
    <section id="projects" className="py-24 relative">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">Projects</h2>

          <div className="flex justify-center mb-12 w-full relative z-10">
            <div className="inline-flex bg-surface/30 backdrop-blur-2xl border border-textMain/15 rounded-full p-2 relative shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <button
                onClick={() => setActiveTab("freelance")}
                className={`focus:outline-none focus:ring-0 outline-none relative px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wide transition-all duration-500 flex items-center gap-3 z-10 ${
                  activeTab === "freelance"
                    ? "text-textMain drop-shadow-lg "
                    : "text-muted-force opacity-40 blur-[1.5px]  hover:blur-none hover:opacity-80"
                }`}
              >
                {activeTab === "freelance" && (
                  <motion.div
                    layoutId="activeGlassBox"
                    style={{ borderRadius: 9999 }}
                    className="absolute inset-0 bg-textMain/10 backdrop-blur-3xl border border-textMain/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.2)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Briefcase size={20} />
                <span className="relative z-10">Freelance</span>
              </button>

              <button
                onClick={() => setActiveTab("personal")}
                className={`focus:outline-none focus:ring-0 outline-none relative px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wide transition-all duration-500 flex items-center gap-3 z-10 ${
                  activeTab === "personal"
                    ? "text-textMain drop-shadow-lg "
                    : "text-muted-force opacity-40 blur-[1.5px]  hover:blur-none hover:opacity-80"
                }`}
              >
                {activeTab === "personal" && (
                  <motion.div
                    layoutId="activeGlassBox"
                    style={{ borderRadius: 9999 }}
                    className="absolute inset-0 bg-textMain/10 backdrop-blur-3xl border border-textMain/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.2)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <User size={20} />
                <span className="relative z-10">Personal</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="relative w-full overflow-hidden min-h-[500px] py-10 -my-10">
          <AnimatePresence mode="popLayout">{renderLayout()}</AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl theme-card bg-bg border border-textMain/20 p-6 md:p-8 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-bl-full -z-10 blur-3xl"></div>
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-surface/80 hover:bg-surface rounded-full transition-colors text-muted-force hover:text-textMain z-20"
              >
                <X size={20} />
              </button>
              <ProjectIcon
                link={selectedProject.link}
                demoLink={selectedProject.demoLink}
                size="modal"
                title={selectedProject.title}
              />
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pr-8">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight m-0">
                    {selectedProject.title}
                  </h3>
                  {selectedProject.status === "Completed" ? (
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold rounded-full uppercase tracking-wider shrink-0 w-fit">
                      Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-full uppercase tracking-wider shrink-0 w-fit">
                      Processing
                    </span>
                  )}
                </div>
                <p className="text-muted-force text-base md:text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                  {selectedProject.desc}
                </p>
              </div>
              <div className="mt-auto pt-6 border-t border-textMain/10 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {selectedProject.link && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm md:text-base font-bold text-[var(--card-bg)]-2 bg-textMain hover:opacity-90 transition-opacity px-6 py-4 rounded-xl"
                    >
                      Live Project <ExternalLink size={18} />
                    </a>
                  )}
                  {selectedProject.demoLink && (
                    <a
                      href={selectedProject.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm md:text-base font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors px-6 py-4 rounded-xl"
                    >
                      Interactive Demo <Play size={18} />
                    </a>
                  )}
                </div>
                {selectedProject.demoLink && (
                  <div className="mt-4 text-[11px] md:text-xs font-bold text-red-400/90 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg flex items-start sm:items-center gap-2">
                    <span className="w-1.5 h-1.5 mt-1 sm:mt-0 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                    Interactive Demo Mode: Changes are temporarily saved to your
                    local browser session, not the live database. You can fully
                    experience and test all features, but data will not be
                    shared or permanently saved.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ProjectCard = ({ project, index, onClick, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: 0.6,
      delay: index * 0.05,
      ease: [0.16, 1, 0.3, 1],
    }}
    className={`${className} cursor-pointer group h-full`}
    onClick={onClick}
  >
    <div className="theme-card border border-textMain/10 group-hover:border-primary/40 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.3)] group-hover:shadow-primary/20 transition-all duration-500 ease-out p-8 h-full flex flex-col justify-center items-center text-center relative overflow-hidden bg-surface/60 backdrop-blur-lg rounded-3xl">
      {/* Dynamic corner glow effect that spreads on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 blur-3xl group-hover:bg-primary/30 group-hover:scale-[1.8] transition-all duration-700 ease-out origin-top-right"></div>

      {/* Bottom ambient glow on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-primary/0 rounded-t-full -z-10 blur-2xl group-hover:bg-primary/15 transition-all duration-500 ease-out"></div>

      <ProjectIcon
        link={project.link}
        demoLink={project.demoLink}
        size="modal"
        title={project.title}
      />
      <h3 className="text-lg md:text-xl font-bold mt-6 tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 w-full relative z-10">
        {project.title}
      </h3>
    </div>
  </motion.div>
);

export default Projects;
