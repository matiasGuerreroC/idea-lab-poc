"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

function MermaidChart({ chart }: MermaidChartProps) {
  const [error, setError] = useState<string | null>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
  }, []);

  useEffect(() => {
    if (!chart || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    setError(null);
    mermaid
      .render(id.current, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        setError(err.message || "Error al renderizar diagrama");
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-800 overflow-x-auto">${chart}</pre>`;
        }
      });
  }, [chart]);

  return (
    <div className="my-4 space-y-2">
      <div ref={containerRef} className="flex justify-center" />
      {error && (
        <pre className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-800 overflow-x-auto whitespace-pre-wrap">
          {error}
        </pre>
      )}
    </div>
  );
}

interface DeliverableViewProps {
  content: string;
}

const MERMAID_BLOCK_RE = /^```mermaid\n([\s\S]*?)```$/;

export function DeliverableView({ content }: DeliverableViewProps) {
  const parts = content.split(/(```mermaid[\s\S]*?```)/g);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {parts.map((part, index) => {
        const mermaidMatch = part.match(MERMAID_BLOCK_RE);
        if (mermaidMatch && mermaidMatch[1].trim()) {
          return <MermaidChart key={index} chart={mermaidMatch[1].trim()} />;
        }
        if (part.startsWith("```mermaid")) {
          return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>;
        }
        return (
          <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
            {part}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
