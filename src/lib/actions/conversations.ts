"use server";

import { generateId } from "@/lib/crypto";
import * as store from "@/lib/store";

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
  const id = generateId();
  return await store.saveConversation(id, projectId, role, content, codeBlocks);
}

export async function getConversations(
  projectId: string
): Promise<ConversationRow[]> {
  return await store.getConversations(projectId);
}
