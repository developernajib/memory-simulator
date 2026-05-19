// Renders a trusted, pre-built HTML string (syntax-highlighted code, descriptions,
// and the dense memory/register markup ported verbatim from the original simulator).
//
// The HTML originates entirely from our own pure formatters and the bundled dataset
// — never from user input — so dangerouslySetInnerHTML is safe here.
import type { JSX } from 'react';

interface HtmlProps {
  html: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export function Html({ html, as: Tag = 'div', className, style, id }: HtmlProps) {
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
