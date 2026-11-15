import { siGithub } from "simple-icons";

/** The GitHub mark (simple-icons), in the current text colour. Decorative: always paired with a label. */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={siGithub.path} />
    </svg>
  );
}
