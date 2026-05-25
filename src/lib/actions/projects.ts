"use server";

import { generateId } from "@/lib/crypto";
import * as store from "@/lib/store";

interface ProjectRow {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createProject(
  userId: string,
  name: string,
  description: string
): Promise<ProjectRow> {
  const id = generateId();
  return await store.createProject(id, userId, name, description);
}

export async function listProjects(userId: string): Promise<ProjectRow[]> {
  return await store.listProjects(userId);
}

export async function getProject(id: string): Promise<ProjectRow | undefined> {
  return await store.getProject(id);
}

export async function deleteProject(id: string): Promise<void> {
  await store.deleteProject(id);
}

export async function renameProject(id: string, name: string): Promise<void> {
  await store.renameProject(id, name);
}
