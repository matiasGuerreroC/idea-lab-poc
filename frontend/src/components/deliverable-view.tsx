"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

interface MermaidChartProps {
  chart: string;
}

function MermaidChart({ chart }: MermaidChartProps) {
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      mermaid
        .render(id.current, chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-800">Error al renderizar diagrama Mermaid</pre>`;
          }
        });
    }
  }, [chart]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}

interface DeliverableViewProps {
  content: string;
}

export function DeliverableView({ content }: DeliverableViewProps) {
  const parts = content.split(/(```mermaid[\s\S]*?```)/g);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {parts.map((part, index) => {
        const mermaidMatch = part.match(/```mermaid\n([\s\S]*?)```/);
        if (mermaidMatch) {
          return <MermaidChart key={index} chart={mermaidMatch[1].trim()} />;
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
