import { siteConfig } from "@/lib/site-config";

interface ProjectInquiryProps {
  projectTitle: string;
}

export function ProjectInquiry({ projectTitle }: ProjectInquiryProps) {
  const href = siteConfig.contactEmail
    ? `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Project inquiry — ${projectTitle}`)}`
    : "/#contact";

  return (
    <section aria-labelledby="project-inquiry-title" className="project-inquiry" data-motion-reveal="">
      <div>
        <p className="eyebrow">Have a story in mind?</p>
        <h2 className="heading-two" id="project-inquiry-title">Let’s begin a conversation.</h2>
      </div>
      <a className="text-link project-inquiry__link" data-cursor="link" data-magnetic="" href={href}>
        Start a project <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
