import katex from "katex";
import "katex/contrib/mhchem";

/** Only explicitly delimited, authored TeX is rendered; ordinary text stays escaped. */
export default function ChemistryText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\$[^$]+\$)/g).map((part, i) => {
        if (!part.startsWith("$") || !part.endsWith("$"))
          return <span key={i}>{part}</span>;
        const html = katex.renderToString(part.slice(1, -1), {
          throwOnError: false,
          trust: false,
          strict: "warn",
          output: "htmlAndMathml",
        });
        return (
          <span
            key={i}
            className="chemical-notation"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
}
