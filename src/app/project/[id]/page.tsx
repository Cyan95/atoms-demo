"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Pencil } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { getProject } from "@/lib/actions/projects";
import { getConversations } from "@/lib/actions/conversations";

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let userId = localStorage.getItem("atoms_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("atoms_user_id", userId);
  }
  return userId;
}

export default function ProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const initialPrompt = searchParams.get("prompt");

  const [code, setCode] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Loading...");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Load project
  useEffect(() => {
    getProject(id).then((p) => {
      if (p) {
        setProjectName(p.name);
        setNameInput(p.name);
        if (p.userId !== getUserId()) {
          // Project belongs to another user in this demo
        }
      } else {
        router.push("/");
      }
    });
  }, [id, router]);

  // Load conversations and restore code
  useEffect(() => {
    getConversations(id).then((convs) => {
      for (let i = convs.length - 1; i >= 0; i--) {
        const c = convs[i];
        if (c.role === "assistant" && c.codeBlocks && c.codeBlocks.length > 0) {
          const lastCode = c.codeBlocks[c.codeBlocks.length - 1];
          setCode(lastCode);
          break;
        }
      }
    });
  }, [id]);

  const handleCodeGenerated = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      setProjectName(nameInput.trim());
      setIsEditingName(false);
      // Could persist to DB here
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {isEditingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSave();
              if (e.key === "Escape") setIsEditingName(false);
            }}
            className="text-sm font-semibold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors"
          >
            {projectName}
            <Pencil className="w-3 h-3 text-gray-300" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {code ? "App ready" : "Describe your idea to start"}
          </span>
          <div className={`w-2 h-2 rounded-full ${code ? "bg-green-400" : "bg-gray-300"}`} />
        </div>
      </header>

      {/* Main panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[45%] min-w-[340px] border-r border-gray-200 flex flex-col">
          <ChatPanel
            projectId={id}
            onCodeGenerated={handleCodeGenerated}
            initialPrompt={initialPrompt}
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col">
          <PreviewPanel code={code} />
        </div>
      </div>
    </div>
  );
}
