/** Loads the landing page's motion code (GSAP and its plugins, see motion/kit.ts) on demand; one shared chunk. */
export const loadMotion = () => import("./kit");
