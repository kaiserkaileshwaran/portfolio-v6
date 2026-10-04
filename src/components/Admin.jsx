import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Briefcase,
  Code,
  Layers,
  History,
  LogOut,
  CheckCircle,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { database } from "../firebase";
import { ref, push, remove, onValue, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[200] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center gap-3 font-medium"
    >
      <CheckCircle size={20} className="text-emerald-500" />
      {message}
    </motion.div>
  );
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("freelance");
  const [toastMessage, setToastMessage] = useState("");

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [history, setHistory] = useState([]);

  const [newProject, setNewProject] = useState({
    title: "",
    desc: "",
    link: "",
    demoLink: "",
    status: "Processing",
  });
  const [newSkill, setNewSkill] = useState({ name: "", group: "Languages" });
  const [newHistory, setNewHistory] = useState({
    role: "",
    company: "",
    period: "",
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);

  const handleEditClick = (item, type) => {
    setEditingId(item.id);
    setActiveTab(type);
    if (type === "freelance" || type === "personal") {
      setNewProject({
        title: item.title || "",
        desc: item.desc || "",
        link: item.link || "",
        demoLink: item.demoLink || "",
        status: item.status || "Processing",
      });
    } else if (type === "skills") {
      setNewSkill({ name: item.name || "", group: item.group || "Languages" });
    } else if (type === "history") {
      setNewHistory({
        role: item.role || "",
        company: item.company || "",
        period: item.period || "",
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProject({
      title: "",
      desc: "",
      link: "",
      demoLink: "",
      status: "Processing",
    });
    setNewSkill({ name: "", group: "Languages" });
    setNewHistory({ role: "", company: "", period: "" });
  };

  const scrollInterval = React.useRef(null);
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    setTimeout(() => {
      if (e.target) e.target.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
    if (e.target) e.target.style.opacity = "1";
    setDraggedItem(null);
    setDragOverId(null);
    setDragOverPosition(null);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    const container = document.getElementById("admin-list-scroll-container");
    if (container) {
      const crect = container.getBoundingClientRect();
      const edge = 100;
      if (e.clientY < crect.top + edge) {
        if (!scrollInterval.current)
          scrollInterval.current = setInterval(
            () => (container.scrollTop -= 20),
            16,
          );
      } else if (e.clientY > crect.bottom - edge) {
        if (!scrollInterval.current)
          scrollInterval.current = setInterval(
            () => (container.scrollTop += 20),
            16,
          );
      } else {
        if (scrollInterval.current) {
          clearInterval(scrollInterval.current);
          scrollInterval.current = null;
        }
      }
    }
    if (!draggedItem || draggedItem.item.id === item.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverId(item.id);
    setDragOverPosition(e.clientY < midY ? "before" : "after");
  };

  const handleDrop = async (e, targetItem, type) => {
    e.preventDefault();
    if (e.target) e.target.style.opacity = "1";

    const dropPos = dragOverPosition;
    setDragOverId(null);
    setDragOverPosition(null);

    if (
      !draggedItem ||
      draggedItem.type !== type ||
      draggedItem.item.id === targetItem.id
    ) {
      setDraggedItem(null);
      return;
    }

    let list = [];
    let path = "";
    if (type === "freelance") {
      list = projects.filter(isFreelanceProj);
      path = "projects";
    } else if (type === "personal") {
      list = projects.filter(isPersonalProj);
      path = "projects";
    } else if (type === "skills") {
      list = skills;
      path = "skills";
    } else if (type === "history") {
      list = history;
      path = "history";
    }

    const oldIndex = list.findIndex((i) => i.id === draggedItem.item.id);
    let newIndex = list.findIndex((i) => i.id === targetItem.id);

    if (dropPos === "after") newIndex += 1;

    const newList = [...list];
    const [removed] = newList.splice(oldIndex, 1);
    if (oldIndex < newIndex) newIndex -= 1;
    newList.splice(newIndex, 0, removed);

    const updates = {};
    newList.forEach((item, index) => {
      updates[`${path}/${item.id}/order`] = index;
    });

    try {
      await update(ref(database), updates);
      showToast("Reordered successfully!");
    } catch (err) {
      console.error(err);
    }
    setDraggedItem(null);
  };

  const tabs = [
    { id: "freelance", label: "Freelance Projects", icon: Briefcase },
    { id: "personal", label: "Personal Projects", icon: Code },
    { id: "skills", label: "Skills", icon: Layers },
    { id: "history", label: "History", icon: History },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      const subs = ["projects", "skills", "history"].map((path) => {
        return onValue(ref(database, path), (snapshot) => {
          const data = snapshot.val();
          const parsed = data
            ? Object.keys(data)
                .map((key) => ({ id: key, ...data[key] }))
                .sort((a, b) => (a.order || 0) - (b.order || 0))
            : [];
          if (path === "projects") setProjects(parsed);
          if (path === "skills") setSkills(parsed);
          if (path === "history") setHistory(parsed);
        });
      });
      return () => subs.forEach((unsub) => unsub());
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "6174") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password. Access denied.");
    }
  };

  const showToast = (msg) => setToastMessage(msg);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.desc) return;
    const type = activeTab === "freelance" ? "freelance" : "personal";

    if (editingId) {
      await update(ref(database, `projects/${editingId}`), {
        ...newProject,
        type,
        isFreelance: type === "freelance",
        isPersonal: type === "personal",
      });
      showToast("Project updated successfully!");
      cancelEdit();
    } else {
      push(ref(database, "projects"), {
        ...newProject,
        type,
        isFreelance: type === "freelance",
        isPersonal: type === "personal",
        order: projects.length,
      });
      setNewProject({
        title: "",
        desc: "",
        link: "",
        demoLink: "",
        status: "Processing",
      });
      showToast("Project added successfully!");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name) return;
    if (editingId) {
      await update(ref(database, `skills/${editingId}`), { ...newSkill });
      showToast("Skill updated successfully!");
      cancelEdit();
    } else {
      push(ref(database, "skills"), { ...newSkill, order: skills.length });
      setNewSkill({ name: "", group: "Languages" });
      showToast("Skill added successfully!");
    }
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!newHistory.role || !newHistory.company) return;
    if (editingId) {
      await update(ref(database, `history/${editingId}`), { ...newHistory });
      showToast("History updated successfully!");
      cancelEdit();
    } else {
      push(ref(database, "history"), { ...newHistory, order: history.length });
      setNewHistory({ role: "", company: "", period: "" });
      showToast("History added successfully!");
    }
  };

  const handleDelete = (path, id) => {
    remove(ref(database, `${path}/${id}`));
    showToast("Item deleted successfully.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-background">
        <div className="w-full max-w-md theme-card p-8 rounded-3xl border border-textMain/20 relative overflow-hidden bg-surface/50 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 blur-2xl"></div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Admin Portal</h2>
              <p className="text-sm text-muted-force">
                Authorized access only.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-background border border-textMain/20 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-bg font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isFreelanceProj = (p) =>
    p.type === "freelance" ||
    p.isFreelance === true ||
    (p.isFreelance !== false && !p.isPersonal && p.type !== "personal");
  const isPersonalProj = (p) =>
    p.type === "personal" || p.isPersonal === true || p.isFreelance === false;

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 md:h-screen md:overflow-hidden bg-background flex flex-col">
      <AnimatePresence>
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        )}
      </AnimatePresence>
      <div className="w-full max-w-[1600px] 2xl:max-w-[1920px] mx-auto flex flex-col h-full">
        {/* Header - Fixed top */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3">
              <ShieldAlert className="text-primary" size={24} /> Admin Dashboard
            </h1>
            <p className="text-sm text-muted-force mt-1">
              Manage your portfolio content in real-time.
            </p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors border border-red-400/20"
          >
            <LogOut size={16} /> End Session
          </button>
        </div>

        {/* Content Area - Scrollable columns on laptop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow md:overflow-hidden">
          {/* Left Column (Tabs + Form) - Fixed on laptop, scrollable if necessary */}
          <div className="md:col-span-1 flex flex-col gap-6 h-full md:overflow-y-auto custom-scrollbar pr-2 pb-12 md:pb-4">
            {/* Tabs */}
            <div className="theme-card rounded-2xl p-2 border border-textMain/10 bg-surface/50 backdrop-blur-md flex flex-col gap-1 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors font-bold ${activeTab === tab.id ? "bg-primary/15 backdrop-blur-md border border-primary/30 text-primary shadow-lg shadow-primary/10" : "border border-transparent hover:bg-textMain/5 text-muted-force hover:text-textMain"}`}
                >
                  <tab.icon
                    size={16}
                    className={
                      activeTab === tab.id ? "text-primary" : "text-primary/60"
                    }
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Box */}
            <div className="theme-card rounded-2xl p-5 border border-textMain/10 bg-surface/50 backdrop-blur-md shrink-0">
              {(activeTab === "freelance" || activeTab === "personal") && (
                <form
                  onSubmit={handleAddProject}
                  className={`space-y-3 transition-all duration-500 relative z-10 ${editingId ? "p-5 rounded-2xl bg-surface/95 border-2 shadow-2xl" : ""}`}
                  style={editingId ? { borderColor: "var(--global-text)" } : {}}
                >
                  {editingId && (
                    <div
                      className="absolute -inset-1.5 rounded-3xl blur-[12px] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none -z-10"
                      style={{
                        backgroundColor: "var(--global-text)",
                        opacity: 0.35,
                      }}
                    ></div>
                  )}
                  <h3 className="font-bold mb-4 capitalize text-sm flex justify-between">
                    {editingId ? "Update" : "Add New"}{" "}
                    {activeTab === "freelance"
                      ? "Freelance Project"
                      : "Personal Project"}{" "}
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 normal-case"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) =>
                        setNewProject({ ...newProject, title: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="e.g. Portfolio Website"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProject.desc}
                      onChange={(e) =>
                        setNewProject({ ...newProject, desc: e.target.value })
                      }
                      rows="3"
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none custom-scrollbar"
                      placeholder="Brief project description..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Live Project URL
                    </label>
                    <input
                      type="url"
                      value={newProject.link || ""}
                      onChange={(e) =>
                        setNewProject({ ...newProject, link: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Interactive Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={newProject.demoLink || ""}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          demoLink: e.target.value,
                        })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="https://"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Project Status
                    </label>
                    <select
                      value={newProject.status || "Processing"}
                      onChange={(e) =>
                        setNewProject({ ...newProject, status: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary py-2.5 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity mt-2 text-bg"
                  >
                    {editingId
                      ? "Update Project"
                      : `Add ${activeTab === "freelance" ? "Freelance" : "Personal"} Project`}
                  </button>
                </form>
              )}

              {activeTab === "skills" && (
                <form
                  onSubmit={handleAddSkill}
                  className={`space-y-3 transition-all duration-500 relative z-10 ${editingId ? "p-5 rounded-2xl bg-surface/95 border-2 shadow-2xl" : ""}`}
                  style={editingId ? { borderColor: "var(--global-text)" } : {}}
                >
                  {editingId && (
                    <div
                      className="absolute -inset-1.5 rounded-3xl blur-[12px] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none -z-10"
                      style={{
                        backgroundColor: "var(--global-text)",
                        opacity: 0.35,
                      }}
                    ></div>
                  )}
                  <h3 className="font-bold mb-4 capitalize text-sm flex justify-between">
                    {editingId ? "Update" : "Add New"} Skill{" "}
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 normal-case"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="e.g. Node.js"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Group Category
                    </label>
                    <select
                      value={newSkill.group}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, group: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                    >
                      <option value="Languages">Languages</option>
                      <option value="Core">Core</option>
                      <option value="Frameworks">Frameworks & Tools</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary py-2.5 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity mt-2 text-bg"
                  >
                    {editingId ? "Update Skill" : "Add Skill"}
                  </button>
                </form>
              )}

              {activeTab === "history" && (
                <form
                  onSubmit={handleAddHistory}
                  className={`space-y-3 transition-all duration-500 relative z-10 ${editingId ? "p-5 rounded-2xl bg-surface/95 border-2 shadow-2xl" : ""}`}
                  style={editingId ? { borderColor: "var(--global-text)" } : {}}
                >
                  {editingId && (
                    <div
                      className="absolute -inset-1.5 rounded-3xl blur-[12px] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none -z-10"
                      style={{
                        backgroundColor: "var(--global-text)",
                        opacity: 0.35,
                      }}
                    ></div>
                  )}
                  <h3 className="font-bold mb-4 capitalize text-sm flex justify-between">
                    {editingId ? "Update" : "Add New"} History Node{" "}
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 normal-case"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Role / Degree
                    </label>
                    <input
                      type="text"
                      value={newHistory.role}
                      onChange={(e) =>
                        setNewHistory({ ...newHistory, role: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="e.g. Senior Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Company / Institution
                    </label>
                    <input
                      type="text"
                      value={newHistory.company}
                      onChange={(e) =>
                        setNewHistory({
                          ...newHistory,
                          company: e.target.value,
                        })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-force mb-1">
                      Time Period
                    </label>
                    <input
                      type="text"
                      value={newHistory.period}
                      onChange={(e) =>
                        setNewHistory({ ...newHistory, period: e.target.value })
                      }
                      className="w-full text-sm bg-background border border-textMain/20 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      placeholder="e.g. 2024-2025"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary py-2.5 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity mt-2 text-bg"
                  >
                    {editingId ? "Update History" : "Add History Node"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (Data Lists) - Independently Scrollable */}
          <div className="md:col-span-2 flex flex-col h-full md:overflow-hidden bg-surface/20 rounded-2xl border border-textMain/5 p-1">
            {/* Fixed Title inside Right Column */}
            <div className="shrink-0 p-4 pb-2">
              <h2 className="text-lg font-bold capitalize flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Current{" "}
                {activeTab
                  .replace("freelance", "Freelance Projects")
                  .replace("personal", "Personal Projects")}
              </h2>
            </div>

            {/* Scrollable List Container */}
            <div
              id="admin-list-scroll-container"
              className="flex-grow md:overflow-y-auto custom-scrollbar p-4 pt-2 pb-24 md:pb-2 overflow-x-hidden"
            >
              <div className="space-y-4">
                {activeTab === "freelance" &&
                  projects.filter(isFreelanceProj).map((project, index) => (
                    <div key={project.id} className="relative">
                      {dragOverId === project.id &&
                        dragOverPosition === "before" && (
                          <div className="w-full flex items-center justify-center py-3 relative mb-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                      <div
                        draggable={true}
                        onDragStart={(e) =>
                          handleDragStart(e, project, "freelance")
                        }
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, project)}

                        onDrop={(e) => handleDrop(e, project, "freelance")}
                        className={`animate-slide-fade-in theme-card p-5 rounded-2xl flex justify-between items-start gap-4 transition-colors bg-surface/80 backdrop-blur-sm shadow-sm group cursor-move ${editingId === project.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background bg-primary/10 shadow-[0_0_20px_var(--primary)]" : "hover:border-primary/50"}`}
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-base font-bold text-primary">
                              {project.title}
                            </h3>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Freelance
                            </span>
                          </div>
                          <p className="text-sm text-muted-force mb-3 line-clamp-2 leading-snug">
                            {project.desc}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono bg-white/5 px-2 py-1 rounded break-all hover:text-primary hover:bg-primary/10 transition-colors inline-block"
                              >
                                Live: {project.link}
                              </a>
                            )}
                            {project.demoLink && (
                              <a
                                href={project.demoLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono bg-white/5 px-2 py-1 rounded break-all hover:text-secondary hover:bg-secondary/10 transition-colors inline-block"
                              >
                                Demo: {project.demoLink}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() =>
                              handleEditClick(project, "freelance")
                            }
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group-hover:text-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete("projects", project.id)}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors group-hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {dragOverId === project.id &&
                        dragOverPosition === "after" && (
                          <div className="w-full flex items-center justify-center py-3 relative mt-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                {activeTab === "personal" &&
                  projects.filter(isPersonalProj).map((project, index) => (
                    <div key={project.id} className="relative">
                      {dragOverId === project.id &&
                        dragOverPosition === "before" && (
                          <div className="w-full flex items-center justify-center py-3 relative mb-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                      <div
                        draggable={true}
                        onDragStart={(e) =>
                          handleDragStart(e, project, "personal")
                        }
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, project)}

                        onDrop={(e) => handleDrop(e, project, "personal")}
                        className={`animate-slide-fade-in theme-card p-5 rounded-2xl flex justify-between items-start gap-4 transition-colors bg-surface/80 backdrop-blur-sm shadow-sm group cursor-move ${editingId === project.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background bg-primary/10 shadow-[0_0_20px_var(--primary)]" : "hover:border-primary/50"}`}
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-base font-bold text-primary">
                              {project.title}
                            </h3>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Personal
                            </span>
                          </div>
                          <p className="text-sm text-muted-force mb-3 line-clamp-2 leading-snug">
                            {project.desc}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono bg-white/5 px-2 py-1 rounded break-all hover:text-primary hover:bg-primary/10 transition-colors inline-block"
                              >
                                Live: {project.link}
                              </a>
                            )}
                            {project.demoLink && (
                              <a
                                href={project.demoLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono bg-white/5 px-2 py-1 rounded break-all hover:text-secondary hover:bg-secondary/10 transition-colors inline-block"
                              >
                                Demo: {project.demoLink}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleEditClick(project, "personal")}
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group-hover:text-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete("projects", project.id)}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors group-hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {dragOverId === project.id &&
                        dragOverPosition === "after" && (
                          <div className="w-full flex items-center justify-center py-3 relative mt-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                {activeTab === "skills" &&
                  skills.map((skill, index) => (
                    <div key={skill.id} className="relative">
                      {dragOverId === skill.id &&
                        dragOverPosition === "before" && (
                          <div className="w-full flex items-center justify-center py-3 relative mb-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, skill, "skills")}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, skill)}

                        onDrop={(e) => handleDrop(e, skill, "skills")}
                        className={`animate-slide-fade-in theme-card p-4 rounded-xl flex justify-between items-center gap-4 transition-colors bg-surface/80 backdrop-blur-sm shadow-sm group cursor-move ${editingId === skill.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background bg-primary/10 shadow-[0_0_20px_var(--primary)]" : "hover:border-primary/50"}`}
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div>
                          <h3 className="text-base font-bold text-primary">
                            {skill.name}
                          </h3>
                          <div className="text-[11px] font-bold text-muted-force mt-0.5 uppercase tracking-wide opacity-80">
                            {skill.group}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditClick(skill, "skills")}
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group-hover:text-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete("skills", skill.id)}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors group-hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {dragOverId === skill.id &&
                        dragOverPosition === "after" && (
                          <div className="w-full flex items-center justify-center py-3 relative mt-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                {activeTab === "history" &&
                  history.map((hist, index) => (
                    <div key={hist.id} className="relative">
                      {dragOverId === hist.id &&
                        dragOverPosition === "before" && (
                          <div className="w-full flex items-center justify-center py-3 relative mb-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, hist, "history")}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, hist)}

                        onDrop={(e) => handleDrop(e, hist, "history")}
                        className={`animate-slide-fade-in theme-card p-5 rounded-xl flex justify-between items-center gap-4 transition-colors bg-surface/80 backdrop-blur-sm shadow-sm group cursor-move ${editingId === hist.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background bg-primary/10 shadow-[0_0_20px_var(--primary)]" : "hover:border-primary/50"}`}
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <div>
                          <h3 className="text-base font-bold text-primary mb-0.5">
                            {hist.role}
                          </h3>
                          <div className="text-sm font-semibold">
                            {hist.company}
                          </div>
                          <div className="text-[11px] text-muted-force mt-1.5 font-bold uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded inline-block">
                            {hist.period}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditClick(hist, "history")}
                            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group-hover:text-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete("history", hist.id)}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors group-hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {dragOverId === hist.id &&
                        dragOverPosition === "after" && (
                          <div className="w-full flex items-center justify-center py-3 relative mt-2 opacity-100 pointer-events-none">
                            <div className="absolute w-full h-[3px] bg-primary/70 rounded-full"></div>
                            <div className="relative w-4 h-4 bg-primary rounded-full z-10 shadow-[0_0_15px_var(--primary)] flex items-center justify-center">
                              <div className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                {/* Empty States */}
                {activeTab === "freelance" &&
                  projects.filter(isFreelanceProj).length === 0 && (
                    <div className="animate-slide-fade-in text-center py-12 text-muted-force bg-surface/30 rounded-2xl border border-textMain/5 border-dashed">
                      No freelance projects yet.
                    </div>
                  )}
                {activeTab === "personal" &&
                  projects.filter(isPersonalProj).length === 0 && (
                    <div className="animate-slide-fade-in text-center py-12 text-muted-force bg-surface/30 rounded-2xl border border-textMain/5 border-dashed">
                      No personal projects yet.
                    </div>
                  )}
                {activeTab === "skills" && skills.length === 0 && (
                  <div className="animate-slide-fade-in text-center py-12 text-muted-force bg-surface/30 rounded-2xl border border-textMain/5 border-dashed">
                    No skills added yet.
                  </div>
                )}
                {activeTab === "history" && history.length === 0 && (
                  <div className="animate-slide-fade-in text-center py-12 text-muted-force bg-surface/30 rounded-2xl border border-textMain/5 border-dashed">
                    No history nodes added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
