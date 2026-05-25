import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)!,
  token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)!,
});

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

function projectKey(id: string) {
  return `project:${id}`;
}
function userProjectIdsKey(userId: string) {
  return `user:${userId}:projectIds`;
}
function conversationsKey(projectId: string) {
  return `project:${projectId}:conversations`;
}

export async function createProject(
  id: string,
  userId: string,
  name: string,
  description: string
): Promise<Project> {
  const now = new Date();
  const project: Project = {
    id,
    userId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  await redis.set(projectKey(id), project);
  const ids: string[] = (await redis.get(userProjectIdsKey(userId))) ?? [];
  ids.unshift(id);
  await redis.set(userProjectIdsKey(userId), ids);
  return project;
}

export async function getProject(
  id: string
): Promise<Project | undefined> {
  const project = await redis.get<Project>(projectKey(id));
  if (!project) return undefined;
  project.createdAt = new Date(project.createdAt);
  project.updatedAt = new Date(project.updatedAt);
  return project;
}

export async function listProjects(userId: string): Promise<Project[]> {
  const ids: string[] = (await redis.get(userProjectIdsKey(userId))) ?? [];
  if (ids.length === 0) return [];
  const keys = ids.map(projectKey);
  const projects = (await redis.mget<Project[]>(...keys)).filter(Boolean) as Project[];
  for (const p of projects) {
    p.createdAt = new Date(p.createdAt);
    p.updatedAt = new Date(p.updatedAt);
  }
  projects.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  return projects;
}

export async function deleteProject(id: string): Promise<void> {
  const project = await getProject(id);
  if (!project) return;
  await redis.del(projectKey(id));
  await redis.del(conversationsKey(id));
  const ids: string[] =
    (await redis.get(userProjectIdsKey(project.userId))) ?? [];
  await redis.set(
    userProjectIdsKey(project.userId),
    ids.filter((pid) => pid !== id)
  );
}

export async function renameProject(
  id: string,
  name: string
): Promise<void> {
  const project = await getProject(id);
  if (!project) return;
  project.name = name;
  project.updatedAt = new Date();
  await redis.set(projectKey(id), project);
}

export async function saveConversation(
  id: string,
  projectId: string,
  role: "user" | "assistant" | "system",
  content: string,
  codeBlocks?: string[]
): Promise<Conversation> {
  const conv: Conversation = {
    id,
    projectId,
    role,
    content,
    codeBlocks: codeBlocks ?? null,
    createdAt: new Date(),
  };
  const list: Conversation[] =
    (await redis.get<Conversation[]>(conversationsKey(projectId))) ?? [];
  list.push(conv);
  await redis.set(conversationsKey(projectId), list);
  return conv;
}

export async function getConversations(
  projectId: string
): Promise<Conversation[]> {
  const list =
    (await redis.get<Conversation[]>(conversationsKey(projectId))) ?? [];
  for (const c of list) {
    c.createdAt = new Date(c.createdAt);
  }
  return list;
}
