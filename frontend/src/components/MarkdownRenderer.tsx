import { FC, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: FC<MarkdownRendererProps> = memo(({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-on-surface mt-8 mb-4 font-headline">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold text-on-surface mt-6 mb-3 font-headline">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold text-on-surface mt-4 mb-2 font-headline">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-on-surface-variant leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-on-surface-variant leading-relaxed mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-on-surface-variant leading-relaxed mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="ml-4">{children}</li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm text-on-surface-variant border border-outline-variant/20 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-surface-container-high font-semibold">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left border-b border-outline-variant/20">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-b border-outline-variant/10">{children}</td>
        ),
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-surface-container-high text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-surface-container-high p-4 rounded-lg overflow-x-auto mb-4">
              <code className="text-sm font-mono text-on-surface">{children}</code>
            </pre>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic text-on-surface-variant mb-4">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-primary underline hover:text-primary-container" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-on-surface">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
