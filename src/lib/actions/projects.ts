"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { generateId } from "@/lib/crypto";
import { eq, desc } from "drizzle-orm";

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
  const now = new Date();
  const project: ProjectRow = {
    id,
    userId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(schema.projects).values(project);
  return project;
}

export async function listProjects(
  userId: string
): Promise<ProjectRow[]> {
  return db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, userId))
    .orderBy(desc(schema.projects.updatedAt));
}

export async function getProject(
  id: string
): Promise<ProjectRow | undefined> {
  const rows = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .limit(1);
  return rows[0];
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(schema.projects).where(eq(schema.projects.id, id));
}

export async function renameProject(id: string, name: string): Promise<void> {
  await db
    .update(schema.projects)
    .set({ name, updatedAt: new Date() })
    .where(eq(schema.projects.id, id));
}
