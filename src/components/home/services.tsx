import { Container, Section } from "@/components/layout/layout-primitives";
import { ServiceImagePreview } from "@/components/motion/service-image-preview";
import { projects } from "@/content/projects";
import { serviceDisciplines } from "@/content/services";

export function Services() {
  return (
    <Section aria-labelledby="services-title" className="services" id="services" spacing="default">
      <Container>
        <div className="services__intro" data-motion-reveal="">
          <p className="eyebrow">A shared visual language</p>
          <h2 className="heading-two" id="services-title">One eye. <em>Many worlds.</em></h2>
        </div>
        <ServiceImagePreview>
          <ol className="services__list">
            {serviceDisciplines.map((service, index) => {
              const relatedProject = projects.find((project) => project.category === service.category);
              return (
                <li
                  className="service-row"
                  data-motion-reveal=""
                  data-service-preview={relatedProject?.coverImage.src}
                  key={service.category}
                >
                  <span aria-hidden="true" className="metadata">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{service.category}</h3>
                  <p>{service.description}</p>
                  <span aria-hidden="true" className="service-row__arrow">↗</span>
                </li>
              );
            })}
          </ol>
        </ServiceImagePreview>
      </Container>
    </Section>
  );
}
