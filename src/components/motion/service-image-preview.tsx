"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface ServiceImagePreviewProps {
  children: ReactNode;
}

export function ServiceImagePreview({ children }: ServiceImagePreviewProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    const preview = previewRef.current;
    if (!scope || !preview) return;

    const desktopMotion = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (min-width: 801px) and (pointer: fine) and (hover: hover)",
    );
    const placePreview = (clientX: number, clientY: number) => {
      const left = clientX < window.innerWidth * 0.65 ? 26 : -250;
      const top = Math.min(window.innerHeight - 220, Math.max(18, clientY - 110));
      preview.style.transform = `translate3d(${clientX + left}px, ${top}px, 0)`;
    };
    const updatePreview = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !desktopMotion.matches) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const row = target.closest<HTMLElement>("[data-service-preview]");
      if (!row || !scope.contains(row)) return;

      const imageSrc = row.dataset.servicePreview;
      if (!imageSrc) return;
      if (imageSrc !== preview.dataset.src) {
        preview.dataset.src = imageSrc;
        setSrc(imageSrc);
      }
      placePreview(event.clientX, event.clientY);
      preview.dataset.active = "true";
    };
    const movePreview = (event: PointerEvent) => {
      if (!desktopMotion.matches || preview.dataset.active !== "true") return;
      placePreview(event.clientX, event.clientY);
    };
    const hidePreview = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const fromRow = event.target.closest("[data-service-preview]");
      const relatedTarget = event.relatedTarget;
      const toRow = relatedTarget instanceof Element ? relatedTarget.closest("[data-service-preview]") : null;
      if (fromRow && fromRow !== toRow) preview.dataset.active = "false";
    };
    const onPreferenceChange = () => {
      if (!desktopMotion.matches) preview.dataset.active = "false";
    };

    scope.addEventListener("pointerover", updatePreview);
    scope.addEventListener("pointermove", movePreview, { passive: true });
    scope.addEventListener("pointerout", hidePreview);
    desktopMotion.addEventListener("change", onPreferenceChange);

    return () => {
      scope.removeEventListener("pointerover", updatePreview);
      scope.removeEventListener("pointermove", movePreview);
      scope.removeEventListener("pointerout", hidePreview);
      desktopMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return (
    <div className="service-hover-scope" ref={scopeRef}>
      {children}
      <div aria-hidden="true" className="service-hover-preview" data-active="false" ref={previewRef}>
        {src ? <Image alt="" fill key={src} loading="eager" sizes="14rem" src={src} /> : null}
      </div>
    </div>
  );
}
