import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function registerFilmGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText, useGSAP);
  registered = true;
}

registerFilmGsap();

export { Flip, gsap, ScrollTrigger, SplitText };
