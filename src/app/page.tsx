"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Code2,
  FolderOpen,
  Clock,
  Trash2,
} from "lucide-react";
import { createProject, listProjects, deleteProject } from "@/lib/actions/projects";

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let userId = localStorage.getItem("atoms_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("atoms_user_id", userId);
  }
  return userId;
}

function useLocalStorage(key: string, initialValue: string): [string, (v: string) => void] {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(localStorage.getItem(key) || initialValue);
  }, [key, initialValue]);
  const set = (v: string) => {
    localStorage.setItem(key, v);
    setValue(v);
  };
  return [value, set];
}

interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: Date;
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useLocalStorage("atoms_user_name", "");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const showNameInput = hydrated ? !name : false;
  const [creating, setCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (hydrated && name) {
      listProjects(getUserId()).then(setProjects);
    }
  }, [hydrated, name]);

  const handleStart = async () => {
    if (!name.trim()) return;
    setName(name.trim());
    setCreating(true);
    try {
      const project = await createProject(getUserId(), "Untitled Project", "");
      router.push(`/project/${project.id}`);
    } catch {
      setCreating(false);
    }
  };

  const handleQuickStart = async (prompt: string, projectName: string) => {
    if (!name.trim()) return;
    setName(name.trim());
    setCreating(true);
    try {
      const project = await createProject(getUserId(), projectName, prompt);
      router.push(
        `/project/${project.id}?prompt=${encodeURIComponent(prompt)}`
      );
    } catch {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Atoms Demo</span>
        </div>
        {hydrated && name && (
          <span className="text-sm text-gray-400">Hi, {name}</span>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        {showNameInput ? (
          /* ---- Name input ---- */
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Atoms Demo
            </h1>
            <p className="text-gray-500 mb-8">
              AI-powered app builder. Describe your idea and watch it come to
              life.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="What should we call you?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleStart}
              disabled={!name.trim() || creating}
              className="mt-4 w-full px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        ) : (
          /* ---- Dashboard ---- */
          <div>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-900 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Turn ideas into apps
                <br />
                <span className="text-gray-400">with AI agents</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Describe what you want to build and our AI engineer will generate
                a complete, runnable application in seconds.
              </p>
            </div>

            {/* Quick start */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-16">
              {[
                {
                  prompt: "Build a todo list with drag and drop",
                  name: "Todo App",
                  icon: Code2,
                },
                {
                  prompt: "Build a personal budget tracker with charts",
                  name: "Budget Tracker",
                  icon: Globe,
                },
                {
                  prompt: "Build a habit tracker with daily streaks",
                  name: "Habit Tracker",
                  icon: Zap,
                },
                {
                  prompt: "Build a recipe search app with filters",
                  name: "Recipe Finder",
                  icon: Sparkles,
                },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickStart(item.prompt, item.name)}
                  disabled={creating}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-left hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <item.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">
                      {item.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 mb-12">
              or{" "}
              <button
                onClick={handleStart}
                disabled={creating}
                className="text-gray-900 underline hover:no-underline"
              >
                start from scratch
              </button>
            </p>

            {/* Recent projects */}
            {projects.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      <FolderOpen className="w-5 h-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700">
                          {project.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
