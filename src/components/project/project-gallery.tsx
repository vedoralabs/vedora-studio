"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/components/motion/motion-utils";
import type { ProjectGallerySection, ProjectImage } from "@/types/project";

interface GalleryFrame {
  image: ProjectImage;
  index: number;
}

interface ProjectGalleryProps {
  sections: readonly ProjectGallerySection[];
  projectTitle: string;
}

export function ProjectGallery({ sections, projectTitle }: ProjectGalleryProps) {
  const framesBySection = useMemo(() => {
    let nextIndex = 0;
    return sections.map((section) => ({
      section,
      frames: section.images.map((image) => ({ image, index: nextIndex++ })),
    }));
  }, [sections]);
  const frames = framesBySection.flatMap(({ frames: sectionFrames }) => sectionFrames);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<ReadonlySet<string>>(() => new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef("");
  const previousScrollRef = useRef({ left: 0, top: 0 });
  const closingRef = useRef(false);
  const lightboxContextRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  const isOpen = activeIndex !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    const context = gsap.context(() => {}, dialog);
    lightboxContextRef.current = context;
    if (!dialog.open) dialog.showModal();
    dialog.dataset.closing = "false";
    dialog.dataset.opened = "false";
    closingRef.current = false;
    let backdropFrame = 0;
    const openingFrame = window.requestAnimationFrame(() => {
      backdropFrame = window.requestAnimationFrame(() => {
        dialog.dataset.opened = "true";
      });
    });
    const inner = dialog.querySelector<HTMLElement>(".lightbox__inner");
    if (inner && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lightboxContextRef.current?.add(() => {
        gsap.fromTo(inner, { opacity: 0.82, y: 7, scale: 0.995 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
      });
    }
    previousOverflowRef.current = document.body.style.overflow;
    previousScrollRef.current = { left: window.scrollX, top: window.scrollY };
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      window.cancelAnimationFrame(openingFrame);
      window.cancelAnimationFrame(backdropFrame);
      dialog.dataset.opened = "false";
      dialog.dataset.closing = "false";
      document.body.style.overflow = previousOverflowRef.current;
      openerRef.current?.focus({ preventScroll: true });
      const rootStyle = document.documentElement.style;
      const previousScrollBehavior = rootStyle.scrollBehavior;
      rootStyle.scrollBehavior = "auto";
      window.scrollTo(previousScrollRef.current.left, previousScrollRef.current.top);
      rootStyle.scrollBehavior = previousScrollBehavior;
      context.revert();
      if (lightboxContextRef.current === context) lightboxContextRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const image = dialogRef.current?.querySelector<HTMLElement>(".lightbox__image");
    if (!image) return;
    const context = gsap.context(() => {
      gsap.fromTo(image, { opacity: 0.72, scale: 1.012 }, { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" });
    }, image);
    return () => context.revert();
  }, [activeIndex, isOpen]);

  const openImage = (frame: GalleryFrame, opener: HTMLElement) => {
    openerRef.current = opener;
    setActiveIndex(frame.index);
  };

  const markImageFailed = (src: string) => {
    setFailedImages((current) => new Set(current).add(src));
  };

  const stepImage = (direction: -1 | 1) => {
    if (activeIndex === null || closingRef.current || frames.length < 2) return;
    setActiveIndex((activeIndex + direction + frames.length) % frames.length);
  };

  const activeFrame = activeIndex === null ? undefined : frames[activeIndex];

  const closeViewer = () => {
    if (activeIndex === null || closingRef.current) return;
    const dialog = dialogRef.current;
    const inner = dialog?.querySelector<HTMLElement>(".lightbox__inner");
    const context = lightboxContextRef.current;
    if (!dialog?.open || !inner || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIndex(null);
      return;
    }

    closingRef.current = true;
    dialog.dataset.closing = "true";
    context.add(() => {
      gsap.to(inner, { opacity: 0.76, y: 5, duration: 0.16, ease: "power2.in", onComplete: () => setActiveIndex(null) });
    });
  };

  return (
    <section aria-label={`${projectTitle} image gallery`} className="project-gallery">
      {framesBySection.map(({ section, frames: sectionFrames }, sectionIndex) => (
        <div
          className={`gallery-section gallery-section--${section.layout}`}
          data-cursor={section.layout === "horizontal" ? "drag" : undefined}
          key={`${section.layout}-${sectionIndex}`}
        >
          {sectionFrames.map((frame) => (
            <figure className="gallery-frame" data-motion-image="" key={`${frame.image.src}-${frame.index}`}>
              <button
                aria-label={`Open image ${frame.index + 1} of ${frames.length}: ${frame.image.alt}`}
                className="gallery-frame__trigger"
                data-cursor="view"
                onClick={(event) => openImage(frame, event.currentTarget)}
                style={frame.image.aspectRatio ? { aspectRatio: frame.image.aspectRatio } : undefined}
                type="button"
              >
                {failedImages.has(frame.image.src) ? (
                  <span aria-hidden="true" className="gallery-frame__fallback">Image unavailable</span>
                ) : (
                  <Image
                    alt={frame.image.alt}
                    className="gallery-frame__image"
                    fill
                    onError={() => markImageFailed(frame.image.src)}
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 72vw, 60vw"
                    src={frame.image.src}
                    style={{ objectPosition: frame.image.objectPosition ?? "center" }}
                  />
                )}
                <span aria-hidden="true" className="gallery-frame__open">View image <span>↗</span></span>
              </button>
              {frame.image.caption ? <figcaption className="caption">{frame.image.caption}</figcaption> : null}
            </figure>
          ))}
          {section.caption ? <p className="gallery-section__caption caption" data-motion-reveal="">{section.caption}</p> : null}
        </div>
      ))}

      <dialog
        aria-label={`${projectTitle} image viewer`}
        className="lightbox"
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeViewer();
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            const focusable = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"),
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first || !last) {
              event.preventDefault();
            } else if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            stepImage(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            stepImage(1);
          }
        }}
        ref={dialogRef}
      >
        {activeFrame ? (
          <div className="lightbox__inner">
            <div className="lightbox__topline">
              <p aria-live="polite" className="lightbox__counter metadata">
                {String(activeFrame.index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
              </p>
              <button aria-label="Close image viewer" className="lightbox__close" onClick={closeViewer} ref={closeButtonRef} type="button">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="lightbox__image-wrap">
              {failedImages.has(activeFrame.image.src) ? (
                <p className="lightbox__fallback">This image is unavailable.</p>
              ) : (
                <Image
                  alt={activeFrame.image.alt}
                  className="lightbox__image"
                  fill
                  loading="eager"
                  onError={() => markImageFailed(activeFrame.image.src)}
                  sizes="100vw"
                  src={activeFrame.image.src}
                  style={{ objectPosition: activeFrame.image.objectPosition ?? "center" }}
                />
              )}
            </div>
            <div className="lightbox__bottomline">
              <p className="lightbox__caption">{activeFrame.image.caption ?? activeFrame.image.alt}</p>
              <div aria-label="Image navigation" className="lightbox__controls">
                <button aria-label="Previous image" className="lightbox__step" disabled={frames.length < 2} onClick={() => stepImage(-1)} type="button">←</button>
                <button aria-label="Next image" className="lightbox__step" disabled={frames.length < 2} onClick={() => stepImage(1)} type="button">→</button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
