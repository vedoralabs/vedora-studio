import { StudioImage } from "@/components/ui/studio-image";
import { StudioLink } from "@/components/ui/studio-link";
import { HeroDepthEnhancement } from "@/components/webgl/hero-depth-enhancement";

export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="hero" id="top">
      <StudioImage
        alt="A woman in a black silk gown in a stone courtyard at dusk"
        aspectRatio="auto"
        className="hero__image"
        objectPosition="62% center"
        preload
        sizes="100vw"
        src="/images/homepage/hero-editorial.png"
        motion
      />
      <HeroDepthEnhancement />
      <div aria-hidden="true" className="hero__veil" />
      <div className="container hero__inner">
        <div className="hero__topline" data-motion-hero="top">
          <p className="eyebrow hero__eyebrow">A point of view, in every frame</p>
          <span className="metadata hero__edition">Independent image-making</span>
        </div>
        <div className="hero__copy">
          <p className="eyebrow hero__discipline" data-motion-hero="eyebrow">For people, brands &amp; places</p>
          <h1 className="hero__title" data-motion-hero="title" id="hero-title">
            The feeling
            <br />
            <em>in the frame.</em>
          </h1>
          <p className="hero__description" data-motion-hero="support">
            Photographs shaped by atmosphere, gesture, and the moments in between.
          </p>
          <StudioLink className="hero__link" data-cursor="link" data-magnetic="" data-motion-hero="cta" href="#projects">
            Explore selected work <span aria-hidden="true">↘</span>
          </StudioLink>
        </div>
        <div className="hero__footline" data-motion-hero="foot">
          <span className="metadata">VEDORA / STUDIO</span>
          <a className="hero__scroll" href="#projects">
            <span>Scroll to explore</span><span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
