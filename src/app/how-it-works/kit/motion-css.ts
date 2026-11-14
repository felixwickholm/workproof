/**
 * Landing page motion, as one style sheet the page hoists into <head>. Everything here only adds
 * arrival: the content is in the HTML and readable without JavaScript, and reduced motion keeps
 * the finished state.
 */
export const MOTION_CSS = `
/* The hero arrives on load in CSS alone: the two headline lines rise from behind their baseline. */
.lp-line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}

.lp-line-inner {
  display: block;
}

@media (prefers-reduced-motion: no-preference) {
  .lp-line-inner {
    animation: lp-line-up 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(120ms + var(--i, 0) * 110ms);
  }

  .lp-load {
    animation: lp-load-rise 600ms var(--ease-out) both;
    animation-delay: var(--d, 0ms);
  }
}

@keyframes lp-line-up {
  from {
    transform: translateY(105%);
  }
}

@keyframes lp-load-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

/*
 * Section entrances, driven by scroll position in CSS: a part rises as it enters the screen. No
 * fill mode: before its range starts a part shows in full, so a full-page capture, a fast scroll
 * and a browser without scroll timelines all read the page complete. The range starts as the part
 * crosses the bottom edge, so the switch to the rising state is never on screen.
 */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .lp-root [data-reveal] {
      animation: lp-reveal linear;
      animation-timeline: view();
      /* Later parts of a section (a higher --r) take a little longer to settle. */
      animation-range: entry 0% entry calc(45% + var(--r, 0) * 10%);
    }
  }
}

@keyframes lp-reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* A link whose arrow moves on hover. */
.lp-arrow {
  display: inline-block;
  transition: transform 240ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  a:hover > .lp-arrow {
    transform: translateX(3px);
  }
}
`;
