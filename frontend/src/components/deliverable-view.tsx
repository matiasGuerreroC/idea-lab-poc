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
    <div className="max-w-none text-body-md text-on-surface leading-relaxed space-y-3">
      {parts.map((part, index) => {
        const mermaidMatch = part.match(MERMAID_BLOCK_RE);
        if (mermaidMatch && mermaidMatch[1].trim()) {
          return <MermaidChart key={index} chart={mermaidMatch[1].trim()} />;
        }
        if (part.startsWith("```mermaid")) {
          return (
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
            </div>
          );
        }

        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        const segments: { type: "md" | "code"; lang?: string; code: string; content: string }[] = [];
        let lastIdx = 0;
        let m: RegExpExecArray | null;

        while ((m = codeBlockRegex.exec(part)) !== null) {
          if (m.index > lastIdx) {
            segments.push({ type: "md", content: part.slice(lastIdx, m.index), code: "" });
          }
          segments.push({ type: "code", lang: m[1] || "", code: m[2], content: "" });
          lastIdx = m.index + m[0].length;
        }
        if (lastIdx < part.length) {
          segments.push({ type: "md", content: part.slice(lastIdx), code: "" });
        }
        if (segments.length === 0) {
          segments.push({ type: "md", content: part, code: "" });
        }

        return (
          <div key={index} className="space-y-3">
            {segments.map((seg, si) => {
              if (seg.type === "code") {
                return (
                  <div key={si} className="bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                    {seg.lang && (
                      <div className="px-4 py-1.5 border-b border-white/5 text-code-sm text-on-surface-variant/60 font-mono">
                        {seg.lang}
                      </div>
                    )}
                    <pre className="p-4 font-mono text-code-md text-secondary overflow-x-auto whitespace-pre-wrap">
                      {seg.code}
                    </pre>
                  </div>
                );
              }
              return (
                <div key={si} className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{seg.content}</ReactMarkdown>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
