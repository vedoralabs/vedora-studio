import { StudioLink } from "@/components/ui/studio-link";

interface ProjectInquiryProps {
  projectSlug: string;
  projectTitle: string;
}

export function ProjectInquiry({ projectSlug, projectTitle }: ProjectInquiryProps) {
  return (
    <section aria-labelledby="project-inquiry-title" className="project-inquiry" data-motion-reveal="">
      <div>
        <p className="eyebrow">Have a story in mind?</p>
        <h2 className="heading-two" id="project-inquiry-title">Let’s begin a conversation.</h2>
      </div>
      <StudioLink
        aria-label={`Start a project inspired by ${projectTitle}`}
        className="project-inquiry__link"
        data-cursor="link"
        data-magnetic=""
        href={`/contact?project=${encodeURIComponent(projectSlug)}`}
      >
        Start a project <span aria-hidden="true">↗</span>
      </StudioLink>
    </section>
  );
}
