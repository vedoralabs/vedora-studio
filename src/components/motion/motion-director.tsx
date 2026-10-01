"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { MotionCursor } from "@/components/motion/motion-cursor";
import { gsap, registerMotionPlugins, ScrollTrigger } from "@/components/motion/motion-utils";

interface MotionDirectorProps {
  children: ReactNode;
}

function animateHero(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  if (!hero) return;

  const image = hero.querySelector<HTMLElement>("[data-motion-image] img");
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (image) {
    timeline.fromTo(
      image,
      { clipPath: "inset(5% 0 0 0)", scale: 1.035, autoAlpha: 0.84 },
      { clipPath: "inset(0% 0 0 0)", scale: 1, autoAlpha: 1, duration: 1.05 },
      0,
    );
  }

  const entrance = [
    ["[data-motion-hero='top']", 0.12, 0.42],
    ["[data-motion-hero='eyebrow']", 0.2, 0.48],
    ["[data-motion-hero='title']", 0.28, 0.62],
    ["[data-motion-hero='support']", 0.48, 0.46],
    ["[data-motion-hero='cta']", 0.58, 0.46],
    ["[data-motion-hero='foot']", 0.72, 0.46],
  ] as const;

  for (const [selector, position, duration] of entrance) {
    const element = hero.querySelector<HTMLElement>(selector);
    if (!element) continue;
    timeline.fromTo(
      element,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration },
      position,
    );
  }
}

function animateScrollElements(root: HTMLElement, mobile: boolean) {
  const offset = mobile ? 10 : 16;

  for (const element of root.querySelectorAll<HTMLElement>("[data-motion-reveal]")) {
    gsap.fromTo(
      element,
      { autoAlpha: 0, y: offset },
      {
        autoAlpha: 1,
        y: 0,
        duration: mobile ? 0.62 : 0.76,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
      },
    );
  }

  for (const frame of root.querySelectorAll<HTMLElement>("[data-motion-image]")) {
    if (frame.closest(".hero")) continue;
    const image = frame.querySelector<HTMLElement>("img");
    if (!image) continue;

    gsap.fromTo(
      image,
      { clipPath: "inset(0% 0% 7% 0%)", scale: 1.035, y: mobile ? 7 : 12 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        y: 0,
        duration: 1.02,
        ease: "power3.out",
        scrollTrigger: { trigger: frame, start: "top 90%", once: true },
      },
    );
  }

  for (const heading of root.querySelectorAll<HTMLElement>("[data-motion-lines]")) {
    const lines = Array.from(heading.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    if (lines.length === 0) continue;

    gsap.fromTo(
      lines,
      { autoAlpha: 0, y: mobile ? 14 : 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 82%", once: true },
      },
    );
  }
}

function attachMagneticInteractions(scope: HTMLElement, context: gsap.Context) {
  const targets = Array.from(scope.querySelectorAll<HTMLElement>("[data-magnetic]"));
  if (targets.length === 0) return;

  let keyboardNavigation = false;
  const cleanup: Array<() => void> = [];
  const resetters: Array<() => void> = [];

  targets.forEach((element, index) => {
    let bounds: DOMRect | null = null;
    const xTo = gsap.quickTo(element, "x", { duration: 0.34, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: 0.34, ease: "power3.out" });
    const move = context.add(`magneticMove${index}`, (event: PointerEvent) => {
      if (keyboardNavigation || !bounds) return;
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.07;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.07;
      xTo(gsap.utils.clamp(-6, 6, x));
      yTo(gsap.utils.clamp(-5, 5, y));
    });
    const reset = context.add(`magneticReset${index}`, () => {
      xTo(0);
      yTo(0);
    });
    resetters.push(() => reset());
    const onMove: EventListener = (event) => move(event as PointerEvent);
    const measure = () => {
      bounds = keyboardNavigation ? null : element.getBoundingClientRect();
    };
    const clear = () => {
      bounds = null;
      reset();
    };

    element.addEventListener("pointerenter", measure);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", clear);
    element.addEventListener("focus", clear);
    cleanup.push(() => {
      element.removeEventListener("pointerenter", measure);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", clear);
      element.removeEventListener("focus", clear);
    });
  });

  const onKeyDown = () => {
    keyboardNavigation = true;
    resetters.forEach((reset) => reset());
  };
  const onPointerMove = () => {
    keyboardNavigation = false;
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
  return () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("pointermove", onPointerMove, true);
    cleanup.forEach((remove) => remove());
  };
}

export function MotionDirector({ children }: MotionDirectorProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    registerMotionPlugins();

    const revealMedia = gsap.matchMedia();
    revealMedia.add(
      { reduceMotion: "(prefers-reduced-motion: reduce)", mobile: "(max-width: 800px)" },
      (context) => {
        if (context.conditions?.reduceMotion) return;

        animateHero(root);
        animateScrollElements(root, Boolean(context.conditions?.mobile));

        const revealFocusedElement = (event: FocusEvent) => {
          if (!(event.target instanceof Element)) return;
          let current: Element | null = event.target;
          while (current && current !== root) {
            if (current.hasAttribute("data-motion-reveal") || current.hasAttribute("data-motion-hero")) {
              gsap.killTweensOf(current);
              gsap.set(current, { opacity: 1, visibility: "visible", x: 0, y: 0, clearProps: "transform,opacity,visibility" });
            }
            if (current.hasAttribute("data-motion-image")) {
              const image = current.querySelector<HTMLElement>("img");
              if (image) {
                gsap.killTweensOf(image);
                gsap.set(image, { clearProps: "transform,opacity,clipPath" });
              }
            }
            current = current.parentElement;
          }
        };
        root.addEventListener("focusin", revealFocusedElement);

        const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          window.cancelAnimationFrame(refreshFrame);
          root.removeEventListener("focusin", revealFocusedElement);
        };
      },
      root,
    );

    const magneticMedia = gsap.matchMedia();
    magneticMedia.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 801px) and (pointer: fine) and (hover: hover)",
      (context) => attachMagneticInteractions(root, context),
      root,
    );

    return () => {
      revealMedia.revert();
      magneticMedia.revert();
    };
  }, [pathname]);

  return (
    <main className="motion-root" id="main-content" ref={rootRef}>
      {children}
      <MotionCursor />
    </main>
  );
}
