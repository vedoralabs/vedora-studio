"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/motion/motion-utils";

export function MotionCursor() {
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 801px) and (pointer: fine) and (hover: hover)",
      (context) => {
        const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });
        const move = context.add("moveCursor", (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          cursor.dataset.visible = "true";
          gsap.to(cursor, { autoAlpha: 1, duration: 0.16, overwrite: "auto" });
          xTo(event.clientX);
          yTo(event.clientY);
        });
        const hide = context.add("hideCursor", () => {
          cursor.dataset.visible = "false";
          gsap.to(cursor, { autoAlpha: 0, duration: 0.14, overwrite: "auto" });
        });
        const moveListener: EventListener = (event) => move(event as PointerEvent);
        const hideListener: EventListener = () => hide();

        const onPointerOver = (event: PointerEvent) => {
          if (!(event.target instanceof Element)) return;
          const target = event.target.closest<HTMLElement>("[data-cursor]");
          cursor.dataset.state = target?.dataset.cursor ?? "default";
        };
        const onPointerOut = (event: PointerEvent) => {
          if (!event.relatedTarget) hide();
        };

        gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        document.addEventListener("pointermove", moveListener, { passive: true });
        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("keydown", hideListener);
        document.addEventListener("pointerout", onPointerOut);

        return () => {
          document.removeEventListener("pointermove", moveListener);
          document.removeEventListener("pointerover", onPointerOver);
          document.removeEventListener("keydown", hideListener);
          document.removeEventListener("pointerout", onPointerOut);
          cursor.dataset.visible = "false";
          cursor.dataset.state = "default";
        };
      },
      cursor,
    );

    return () => media.revert();
  }, []);

  return (
    <span aria-hidden="true" className="motion-cursor" data-state="default" data-visible="false" ref={cursorRef}>
      <span className="motion-cursor__label" />
    </span>
  );
}
