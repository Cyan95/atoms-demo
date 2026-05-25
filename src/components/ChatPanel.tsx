"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Code2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatPanelProps {
  projectId: string;
  onCodeGenerated: (code: string) => void;
  initialMessages?: Message[];
  initialPrompt?: string | null;
}

function extractCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```html\n?([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

export default function ChatPanel({
  projectId,
  onCodeGenerated,
  initialMessages,
  initialPrompt,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages ?? []
  );
  const [hydrated, setHydrated] = useState(
    (initialMessages?.length ?? 0) > 0
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialPromptSent = useRef(false);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && !hydrated) {
      setMessages(initialMessages);
      setHydrated(true);
    }
  }, [initialMessages, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        role: "user",
        content: userMessage.content,
      }),
    });

    const assistantId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortRef.current = new AbortController();

      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        );

        const blocks = extractCodeBlocks(fullContent);
        if (blocks.length > 0) {
          onCodeGenerated(blocks[blocks.length - 1]);
        }
      }

      const finalBlocks = extractCodeBlocks(fullContent);
      fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          role: "assistant",
          content: fullContent,
          codeBlocks: finalBlocks,
        }),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, an error occurred. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  // Auto-send initial prompt
  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true;
      sendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    sendMessage(currentInput);
  };

  const handleSuggest = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <span className="font-semibold text-gray-800">Atoms Agent</span>
        <span className="text-xs text-gray-400 ml-auto">Alex - Engineer</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              What do you want to build?
            </h3>
            <p className="text-sm text-gray-500">
              Describe your app idea and I will generate it for you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "A todo list with categories",
                "A personal budget tracker",
                "A habit tracker with streaks",
                "A recipe search app",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggest(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" &&
                extractCodeBlocks(msg.content).length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-purple-500">
                    <Code2 className="w-3 h-3" />
                    Code generated
                  </div>
                )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-medium">U</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
