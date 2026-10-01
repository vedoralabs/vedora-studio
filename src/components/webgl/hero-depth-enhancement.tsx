"use client";

import { useEffect, useRef } from "react";

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

function supportsEnhancement(media: MediaQueryList): boolean {
  const browser = window.navigator as NavigatorWithDeviceMemory;
  const lowMemory = typeof browser.deviceMemory === "number" && browser.deviceMemory <= 2;
  const lowCoreCount = browser.hardwareConcurrency > 0 && browser.hardwareConcurrency <= 2;

  return media.matches && !lowMemory && !lowCoreCount;
}

export function HeroDepthEnhancement() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const image = hero?.querySelector<HTMLImageElement>(".hero__image img");
    if (!canvas || !hero || !image) return;

    const media = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    const idleWindow = window;
    let active = true;
    let generation = 0;
    let delayId: number | null = null;
    let idleId: number | null = null;
    let stopRenderer: (() => void) | null = null;

    const removeImageListeners = () => {
      image.removeEventListener("load", onImageLoad);
      image.removeEventListener("error", onImageError);
    };

    const cancelPendingWork = () => {
      generation += 1;
      if (delayId !== null) window.clearTimeout(delayId);
      if (idleId !== null) {
        if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
      delayId = null;
      idleId = null;
      removeImageListeners();
    };

    const beginLoad = () => {
      if (!active || !supportsEnhancement(media) || stopRenderer || delayId !== null || idleId !== null) return;

      const token = ++generation;
      const loadRenderer = () => {
        removeImageListeners();
        if (!active || !supportsEnhancement(media) || image.naturalWidth === 0) return;

        const loadChunk = () => {
          idleId = null;
          void import("@/components/webgl/hero-depth-renderer")
            .then(({ createHeroDepthRenderer }) => {
              if (!active || token !== generation || !supportsEnhancement(media)) return;
              stopRenderer = createHeroDepthRenderer(canvas, image, hero);
            })
            .catch(() => {
              canvas.dataset.state = "fallback";
            });
        };

        if (idleWindow.requestIdleCallback) {
          idleId = idleWindow.requestIdleCallback(loadChunk, { timeout: 900 });
        } else {
          idleId = window.setTimeout(loadChunk, 0);
        }
      };

      const waitForInitialReveal = () => {
        // Let the existing 1.2s hero reveal settle before the overlay takes over the photograph.
        delayId = window.setTimeout(() => {
          delayId = null;
          loadRenderer();
        }, 1450);
      };

      if (image.complete) {
        if (image.naturalWidth > 0) waitForInitialReveal();
        return;
      }

      image.addEventListener("load", onImageLoad, { once: true });
      image.addEventListener("error", onImageError, { once: true });
    };

    function onImageLoad() {
      removeImageListeners();
      beginLoad();
    }

    function onImageError() {
      removeImageListeners();
    }

    const syncCapability = () => {
      if (supportsEnhancement(media)) {
        beginLoad();
        return;
      }

      cancelPendingWork();
      stopRenderer?.();
      stopRenderer = null;
      canvas.removeAttribute("data-state");
    };

    media.addEventListener("change", syncCapability);
    window.addEventListener("resize", syncCapability, { passive: true });
    syncCapability();

    return () => {
      active = false;
      cancelPendingWork();
      media.removeEventListener("change", syncCapability);
      window.removeEventListener("resize", syncCapability);
      stopRenderer?.();
      stopRenderer = null;
      canvas.removeAttribute("data-state");
    };
  }, []);

  return <canvas aria-hidden="true" className="hero-depth-canvas" ref={canvasRef} tabIndex={-1} />;
}
