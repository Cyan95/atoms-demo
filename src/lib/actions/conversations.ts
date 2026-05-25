"use server";

import { db, schema } from "@/lib/db";
import { generateId } from "@/lib/crypto";
import { eq, asc } from "drizzle-orm";

interface ConversationRow {
  id: string;
  projectId: string;
  role: "user" | "assistant" | "system";
  content: string;
  codeBlocks: string[] | null;
  createdAt: Date;
}

export async function saveConversation(
  projectId: string,
  role: "user" | "assistant" | "system",
  content: string,
  codeBlocks?: string[]
): Promise<ConversationRow> {
  const row: ConversationRow = {
    id: generateId(),
    projectId,
    role,
    content,
    codeBlocks: codeBlocks ?? null,
    createdAt: new Date(),
  };
  await db.insert(schema.conversations).values(row);
  return row;
}

export async function getConversations(
  projectId: string
): Promise<ConversationRow[]> {
  return db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.projectId, projectId))
    .orderBy(asc(schema.conversations.createdAt));
}
