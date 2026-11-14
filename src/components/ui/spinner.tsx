/** A small iOS-style activity indicator that follows the text colour. */
export function Spinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-[18px] animate-[spin_800ms_linear_infinite] motion-reduce:animate-none"
    >
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M10 2a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
