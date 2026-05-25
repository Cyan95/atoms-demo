"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Code2, ExternalLink, RefreshCw } from "lucide-react";

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; background: #f8fafc; }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center">
  <div class="text-center p-8">
    <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
      <svg class="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    </div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Ready to Build</h1>
    <p class="text-gray-500 max-w-md">Describe your app idea in the chat panel, and watch it come to life here.</p>
  </div>
</body>
</html>`;

interface PreviewPanelProps {
  code: string | null;
  onRefresh?: () => void;
}

export default function PreviewPanel({ code, onRefresh }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [error, setError] = useState<string | null>(null);

  const srcDoc = code || WELCOME_HTML;

  const updateIframe = useCallback(() => {
    if (!iframeRef.current) return;
    setError(null);
    try {
      iframeRef.current.srcdoc = srcDoc;
    } catch {
      setError("Failed to render preview");
    }
  }, [srcDoc]);

  useEffect(() => {
    updateIframe();
  }, [code, updateIframe]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "runtime_error") {
        setError(event.data.message);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const iframeWithErrorHandler = srcDoc.replace(
    "<head>",
    `<head>
<script>
window.onerror = function(msg, url, line, col, err) {
  window.parent.postMessage({ type: 'runtime_error', message: msg.toString() }, '*');
  return false;
};
</script>`
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 px-2">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Monitor className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Code2 className="w-4 h-4" />
          Code
        </button>
        <div className="ml-auto flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              const blob = new Blob([srcDoc], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "preview" ? (
        <div className="flex-1 relative bg-gray-100">
          {error && (
            <div className="absolute top-2 left-2 right-2 z-10 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={iframeWithErrorHandler}
            sandbox="allow-scripts allow-forms allow-same-origin"
            className="w-full h-full border-0"
            title="App Preview"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-900">
          <pre className="p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap">
            {srcDoc}
          </pre>
        </div>
      )}
    </div>
  );
}
