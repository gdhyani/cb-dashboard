/**
 * All page-level motion of the landing page, on ONE clock (the GSAP ticker drives Lenis and ScrollTrigger).
 * Markup API (inside the landing root):
 *   data-split            heading lines rise out of a mask (data-intro: with the page intro, else on scroll)
 *   data-reveal           block slides in along the wire (x), "stagger" does it per child
 *   data-rekey            text re-keys from noise to itself when it scrolls into view
 *   data-tone="night"     the header follows dark sections
 *   data-chapter / data-node / data-packet   the "how it works" figure
 *   data-marker-group     a highlighter bar slides under the hovered or focused link
 *   data-fill             button: highlighter sweeps in from the pointer's side, label re-keys
 *   data-row              list row: its [data-row-value] re-keys on hover / focus
 * Returns a cleanup that reverts every tween, trigger, split and listener.
 */
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { ease, isTouch, MOTION_CLASS, prefersReducedMotion } from "./env";
import { PACKET, type PacketState, packetStateAt } from "./packet";
import { rekey, rekeyFrame } from "./rekey";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

type Off = () => void;

function listen<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  offs: Off[],
) {
  el.addEventListener(type, fn);
  offs.push(() => el.removeEventListener(type, fn));
}

function smoothScroll(offs: Off[]) {
  const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -64 }, allowNestedScroll: true, autoRaf: false });
  const raf = (time: number) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  offs.push(() => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  });
  return lenis;
}

/** Header: follows dark sections, steps aside while scrolling down, returns on the way up. */
function header(root: HTMLElement, motion: boolean) {
  const bar = root.querySelector<HTMLElement>("[data-lp-header]");
  if (!bar) return;
  for (const section of root.querySelectorAll<HTMLElement>('[data-tone="night"]')) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 32px",
      end: "bottom 32px",
      onToggle: (self) => {
        bar.dataset.tone = self.isActive ? "night" : "paper";
      },
    });
  }
  if (!motion) return;
  // When scrolling stops, the dock comes back (the header stays put until the visitor scrolls up).
  const dockBack = gsap.delayedCall(1.2, () => document.documentElement.classList.remove("lp-scrolling-down")).pause();
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const away =
        self.direction === 1 && self.scroll() > 160 && !document.documentElement.classList.contains("lp-menu-open");
      bar.classList.toggle("is-away", away);
      // The bottom theme dock steps aside with the header, and is back at the very end of the page.
      document.documentElement.classList.toggle("lp-scrolling-down", away && self.progress < 0.995);
      dockBack.restart(true);
    },
  });
}

function reveals(root: HTMLElement, intro: gsap.core.Timeline) {
  for (const el of root.querySelectorAll<HTMLElement>("[data-split]")) {
    const isIntro = el.hasAttribute("data-intro");
    const delay = Number.parseFloat(el.dataset.delay ?? "0");
    let done = false;
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      linesClass: "lp-split-line",
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        if (done) return;
        const tween = gsap.from(self.lines, {
          yPercent: 112,
          duration: 1.15,
          stagger: 0.08,
          ease: ease.out,
          delay,
          paused: isIntro,
          onComplete: () => {
            done = true;
          },
          scrollTrigger: isIntro ? undefined : { trigger: el, start: "top 88%", once: true },
        });
        if (isIntro) intro.add(() => void tween.play(), 0);
        return tween;
      },
    });
  }

  for (const el of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
    const isIntro = el.hasAttribute("data-intro");
    const delay = Number.parseFloat(el.dataset.delay ?? "0");
    const targets = el.dataset.reveal === "stagger" ? Array.from(el.children) : [el];
    gsap.set(el, { visibility: "visible" });
    const tween = gsap.from(targets, {
      x: -28,
      autoAlpha: 0,
      duration: 1.1,
      stagger: 0.06,
      ease: ease.out,
      delay,
      paused: isIntro,
      scrollTrigger: isIntro ? undefined : { trigger: el, start: "top 90%", once: true },
    });
    if (isIntro) intro.add(() => void tween.play(), 0);
  }

  for (const el of root.querySelectorAll<HTMLElement>("[data-rekey]")) {
    const final = el.textContent ?? "";
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => {
        el.textContent = rekeyFrame(final, final, 0);
        rekey(el, final, { duration: 0.9, delay: Number.parseFloat(el.dataset.delay ?? "0.15") });
      },
    });
  }
}

/**
 * The path figure. Scroll sets a TARGET node position; the packet glides to it, and everything else (its place, the
 * active node and chapter, and the key it carries) is rendered from where the packet IS, on every frame of that glide.
 * So the value can never change ahead of the packet, at any scroll speed.
 */
function path(root: HTMLElement, motion: boolean) {
  const figure = root.querySelector<HTMLElement>("[data-path]");
  const track = figure?.querySelector<HTMLElement>(".lp-path__track");
  const packet = figure?.querySelector<HTMLElement>("[data-packet]");
  const label = packet?.querySelector<HTMLElement>("[data-packet-label]");
  const note = packet?.querySelector<HTMLElement>("[data-packet-note]");
  const caption = figure?.querySelector<HTMLElement>("[data-path-caption]");
  const list = root.querySelector<HTMLElement>(".lp-chapters");
  if (!figure || !track || !packet || !label || !list) return;
  const nodes = Array.from(figure.querySelectorAll<HTMLElement>("[data-node]"));
  const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
  const n = nodes.length;
  let centres: { x: number; y: number }[] = [];
  let horizontal = false;
  let state: PacketState | null = null;
  let active = -1;
  let rekeying: gsap.core.Tween | null = null;
  const shown = { f: 0 };

  const measure = () => {
    horizontal = getComputedStyle(track).flexDirection === "row";
    const t = track.getBoundingClientRect();
    centres = nodes.map((node) => {
      const b = (node.querySelector<HTMLElement>("[data-node-dot]") ?? node).getBoundingClientRect();
      return { x: b.left - t.left + b.width / 2, y: b.top - t.top + b.height / 2 };
    });
  };

  const setState = (next: PacketState) => {
    if (next === state) return;
    const first = state === null;
    state = next;
    rekeying?.kill();
    rekeying = null;
    packet.dataset.state = next;
    if (note) note.textContent = PACKET[next].note;
    if (first || !motion) label.textContent = PACKET[next].text;
    else {
      label.textContent = rekeyFrame(PACKET[next].text, PACKET[next].text, 0.15);
      rekeying = rekey(label, PACKET[next].text, { duration: 0.4 });
    }
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    figure.dataset.step = String(i);
    nodes.forEach((node, k) => {
      node.classList.toggle("is-active", k === i);
      node.classList.toggle("is-passed", k < i);
    });
    chapters.forEach((c, k) => {
      c.classList.toggle("is-active", k === i);
    });
  };

  /** Render everything from the packet's displayed position f (0 … n-1). */
  const render = () => {
    const f = shown.f;
    const i0 = Math.min(n - 2, Math.max(0, Math.floor(f)));
    const t = f - i0;
    const a = centres[i0];
    const b = centres[i0 + 1];
    if (a && b) {
      if (horizontal) {
        // Phones: the packet is a dot that sits exactly on the wire; the caption carries the value.
        gsap.set(packet, { x: a.x + (b.x - a.x) * t, y: 0 });
      } else {
        gsap.set(packet, { x: 0, y: a.y + (b.y - a.y) * t });
      }
    }
    setActive(Math.round(f));
    setState(packetStateAt(f));
    if (caption && state) {
      const name = nodes[active]?.querySelector(".lp-path__name")?.textContent ?? "";
      const text = `${name} · ${PACKET[state].text}`;
      if (caption.textContent !== text) caption.textContent = text;
      caption.dataset.state = state;
    }
  };

  const glide = gsap.quickTo(shown, "f", { duration: motion ? 0.55 : 0, ease: ease.soft, onUpdate: render });
  const target = (p: number) => {
    // Settle on the nearest stop (centred on each chapter): the packet always rests on a node's row, never between
    // two; it glides to the next one when the chapter changes, and its value still flips only as IT crosses halfway.
    const f = Math.round(gsap.utils.clamp(0, n - 1, p * n - 0.5));
    if (motion) glide(f);
    else {
      shown.f = f;
      render();
    }
  };

  measure();
  render();
  ScrollTrigger.create({
    trigger: list,
    start: "top 62%",
    end: "bottom 62%",
    onUpdate: (self) => target(self.progress),
    // A jump straight past either end may skip onUpdate: pin the ends explicitly.
    onLeaveBack: () => target(0),
    onLeave: () => target(1),
    onRefresh: (self) => {
      measure();
      target(self.progress);
      render();
    },
  });
  return () => {
    rekeying?.kill();
  };
}

/**
 * Leak rows, told by scroll (scrubbed, so they play forwards and backwards with the visitor):
 *   in      the stage slides in from the right while the terminal types the problem, the wire draws to its
 *           destinations and they pop in, red: "now holds sk_live_…";
 *   sweep   a scan line runs top to bottom; above it, the same terminal with cb (placeholders); the destinations flip
 *           to "gets a worthless placeholder";
 *   out     the row fades as the next one takes over.
 * Phones: the same timeline, scrubbed over a shorter distance.
 */
function leakRows(root: HTMLElement) {
  for (const row of root.querySelectorAll<HTMLElement>("[data-leak]")) {
    const stage = row.querySelector<HTMLElement>("[data-leak-stage]");
    const lines = row.querySelectorAll<HTMLElement>("[data-line]");
    const wire = row.querySelector<HTMLElement>("[data-leak-wire]");
    const to = row.querySelectorAll<HTMLElement>("[data-leak-to]");
    const overlay = row.querySelector<HTMLElement>("[data-leak-overlay]");
    const scan = row.querySelector<HTMLElement>("[data-leak-scan]");
    const layers = overlay?.parentElement;
    if (!stage || !overlay || !scan || !layers) continue;
    const fromRight = row.dataset.side === "right" ? -1 : 1;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: "top 85%", end: "bottom 20%", scrub: 0.6, invalidateOnRefresh: true },
    });
    tl.fromTo(
      stage,
      { x: 120 * fromRight, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" },
      0,
    ).fromTo(
      lines,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.04, ease: "steps(20)", stagger: 0.025 },
      0.06,
    );
    if (wire)
      tl.fromTo(wire, { scaleY: 0 }, { scaleY: 1, duration: 0.08, ease: "none", transformOrigin: "top center" }, 0.24);
    tl.fromTo(
      to,
      { scale: 0.7, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.06, ease: "back.out(2.4)", stagger: 0.02 },
      0.3,
    )
      // The sweep: the picture with cb from the top down.
      .fromTo(
        scan,
        { y: 0, autoAlpha: 1 },
        { y: () => layers.offsetHeight, duration: 0.25, ease: "none", immediateRender: false },
        0.4,
      )
      .fromTo(
        overlay,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.25, ease: "none" },
        0.4,
      )
      .to(scan, { autoAlpha: 0, duration: 0.02 }, 0.65)
      .call(() => row.classList.toggle("is-safe", tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true), [], 0.66)
      // Hand over to the next row.
      .to(stage, { autoAlpha: 0.15, x: -60 * fromRight, duration: 0.14, ease: "power2.in" }, 0.86);
    // A scrubbed .call only fires going forwards; keep the destination state honest in both directions.
    tl.eventCallback("onUpdate", () => row.classList.toggle("is-safe", tl.progress() >= 0.66));
  }
}

/** Nav: a highlighter bar slides under the hovered / focused link. */
function markers(root: HTMLElement, offs: Off[]) {
  for (const group of root.querySelectorAll<HTMLElement>("[data-marker-group]")) {
    const marker = group.querySelector<HTMLElement>("[data-marker]");
    if (!marker) continue;
    const x = gsap.quickTo(marker, "x", { duration: 0.45, ease: ease.soft });
    const w = gsap.quickTo(marker, "width", { duration: 0.45, ease: ease.soft });
    let shown = false;
    const show = (link: HTMLElement) => {
      const g = group.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (!shown) gsap.set(marker, { x: r.left - g.left, width: 0 });
      shown = true;
      x(r.left - g.left);
      w(r.width);
      gsap.to(marker, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
    };
    const hide = () => {
      shown = false;
      gsap.to(marker, { autoAlpha: 0, duration: 0.3, overwrite: "auto" });
    };
    for (const link of group.querySelectorAll<HTMLElement>("a")) {
      listen(link, "pointerenter", () => show(link), offs);
      listen(link, "focus", () => link.matches(":focus-visible") && show(link), offs);
      listen(link, "blur", hide, offs);
    }
    listen(group, "pointerleave", hide, offs);
  }
}

/** Buttons: the highlighter sweeps in from the side the pointer came from; the label re-keys. */
function buttons(root: HTMLElement, offs: Off[]) {
  for (const btn of root.querySelectorAll<HTMLElement>("[data-fill]")) {
    const fill = btn.querySelector<HTMLElement>("[data-fill-layer]");
    const label = btn.querySelector<HTMLElement>("[data-fill-label]");
    if (!fill) continue;
    const finalLabel = label?.textContent ?? "";
    const side = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      return e.clientX - r.left < r.width / 2 ? "left" : "right";
    };
    const closed = (from: "left" | "right") => (from === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)");
    const open = (from: "left" | "right") => {
      btn.classList.add("is-filled");
      gsap.fromTo(
        fill,
        { clipPath: closed(from) },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: ease.soft, overwrite: true },
      );
      if (label) {
        label.textContent = rekeyFrame(finalLabel, finalLabel, 0.2);
        rekey(label, finalLabel, { duration: 0.45 });
      }
    };
    const close = (to: "left" | "right") => {
      btn.classList.remove("is-filled");
      gsap.to(fill, { clipPath: closed(to), duration: 0.4, ease: ease.soft, overwrite: true });
    };
    listen(btn, "pointerenter", (e) => open(side(e)), offs);
    listen(btn, "pointerleave", (e) => close(side(e)), offs);
    listen(btn, "focus", () => btn.matches(":focus-visible") && open("left"), offs);
    listen(btn, "blur", () => close("right"), offs);
  }
}

/** Cards: the border spotlight follows the pointer (CSS reads --mx / --my). */
function spotlights(root: HTMLElement, offs: Off[]) {
  for (const card of root.querySelectorAll<HTMLElement>("[data-spotlight]")) {
    listen(
      card,
      "pointermove",
      (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      offs,
    );
  }
}

/** Rows: hovering or focusing a row re-keys its example value. */
function rows(root: HTMLElement, offs: Off[]) {
  for (const row of root.querySelectorAll<HTMLElement>("[data-row]")) {
    const value = row.querySelector<HTMLElement>("[data-row-value]");
    if (!value) continue;
    const final = value.textContent ?? "";
    const play = () => {
      value.textContent = rekeyFrame(final, final, 0.1);
      rekey(value, final, { duration: 0.55 });
    };
    listen(row, "pointerenter", play, offs);
    listen(row, "focusin", play, offs);
  }
}

export function startLanding(root: HTMLElement): Off {
  const motion = !prefersReducedMotion();
  const html = document.documentElement;
  const offs: Off[] = [];
  html.classList.toggle(MOTION_CLASS, motion);

  if (motion) smoothScroll(offs);
  const ctx = gsap.context(() => {
    header(root, motion);
    const offPath = path(root, motion);
    if (offPath) offs.push(offPath);
    if (!motion) return;
    const intro = gsap.timeline({ paused: true });
    reveals(root, intro);
    leakRows(root);
    if (!isTouch()) {
      markers(root, offs);
      buttons(root, offs);
      rows(root, offs);
      spotlights(root, offs);
    }
    intro.play();
  }, root);

  requestAnimationFrame(() => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    for (const off of offs.splice(0)) off();
    ctx.revert();
    html.classList.remove(MOTION_CLASS, "lp-scrolling-down");
  };
}
