import { ExternalLink } from "lucide-react";
import type { VideoResource } from "../types";
export default function SourceList({ sources }: { sources: VideoResource[] }) {
  return (
    <div className="source-list">
      {sources.map((item) => (
        <a
          href={item.url}
          key={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            <strong>{item.title}</strong>
            <small>{item.source}</small>
          </span>
          <ExternalLink size={15} />
        </a>
      ))}
    </div>
  );
}
