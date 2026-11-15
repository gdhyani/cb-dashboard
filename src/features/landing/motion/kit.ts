/**
 * Every piece of GSAP the landing page uses, registered once. Never imported statically by a component: components get
 * it through `loadMotion()` (motion/load.ts) when their section comes near the screen, and start-landing (itself loaded
 * after first paint) imports it directly, so GSAP is not part of the page's first JavaScript.
 */
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin, ScrollTrigger, SplitText);

export { centerPin } from "./center-pin";
export { gsap, ScrollTrigger, SplitText };
