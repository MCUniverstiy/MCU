import type { CSSProperties } from 'react';

/** Turn Enter / typed <br> / typed \n into real line breaks on the page. */
export function descriptionLines(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\\n/g, '\n')
    .split('\n');
}

export default function FormattedDescription({
  text,
  style,
}: {
  text: string;
  style?: CSSProperties;
}) {
  const lines = descriptionLines(text);

  return (
    <p style={{ margin: 0, whiteSpace: 'pre-line', ...style }}>
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}
