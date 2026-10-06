import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <Link aria-label="Vedora Studio home" className="wordmark" href="/">
          {siteConfig.brand}
        </Link>
        <p>Independent image-making, with a considered point of view.</p>
      </div>
      <div className="footer-links">
        <div>
          <span className="footer-label">Navigate</span>
          <nav aria-label="Footer navigation" className="footer-nav">
            {siteConfig.navigation.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div className="footer-contact">
          <span className="footer-label">Inquiries</span>
          {siteConfig.contactEmail ? (
            <a className="text-link" href={`mailto:${siteConfig.contactEmail}`} id="studio-contact">Email the studio <span aria-hidden="true">↗</span></a>
          ) : (
            <Link className="text-link" href="/contact" id="studio-contact">Begin a project <span aria-hidden="true">↗</span></Link>
          )}
        </div>
      </div>
      {siteConfig.socialLinks.length > 0 ? (
        <nav aria-label="Social media" className="footer-social">
          <span className="footer-label">Elsewhere</span>
          {siteConfig.socialLinks.map((social) => (
            <a className="text-link" href={social.href} key={social.href} rel="noreferrer" target="_blank">{social.label} <span aria-hidden="true">↗</span></a>
          ))}
        </nav>
      ) : null}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span>Fictional portfolio studies · created for presentation</span>
      </div>
    </footer>
  );
}
