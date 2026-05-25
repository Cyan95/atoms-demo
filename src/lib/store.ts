// In-memory store for serverless deployment.
// Replaces SQLite/Drizzle for Vercel compatibility.

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Conversation {
  id: string;
  projectId: string;
  role: "user" | "assistant" | "system";
  content: string;
  codeBlocks: string[] | null;
  createdAt: Date;
}

const projects = new Map<string, Project>();
const conversations = new Map<string, Conversation[]>();

export function createProject(
  id: string,
  userId: string,
  name: string,
  description: string
): Project {
  const now = new Date();
  const project: Project = { id, userId, name, description, createdAt: now, updatedAt: now };
  projects.set(id, project);
  conversations.set(id, []);
  return project;
}

export function getProject(id: string): Project | undefined {
  return projects.get(id);
}

export function listProjects(userId: string): Project[] {
  return Array.from(projects.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function deleteProject(id: string): void {
  projects.delete(id);
  conversations.delete(id);
}

export function renameProject(id: string, name: string): void {
  const project = projects.get(id);
  if (project) {
    project.name = name;
    project.updatedAt = new Date();
  }
}

export function saveConversation(
  id: string,
  projectId: string,
  role: "user" | "assistant" | "system",
  content: string,
  codeBlocks?: string[]
): Conversation {
  const conv: Conversation = {
    id,
    projectId,
    role,
    content,
    codeBlocks: codeBlocks ?? null,
    createdAt: new Date(),
  };
  const list = conversations.get(projectId);
  if (list) {
    list.push(conv);
  } else {
    conversations.set(projectId, [conv]);
  }
  return conv;
}

export function getConversations(projectId: string): Conversation[] {
  return conversations.get(projectId) ?? [];
}
