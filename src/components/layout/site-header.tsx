import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link aria-label="Vedora Studio home" className="wordmark" href="/">
        {siteConfig.brand}
      </Link>
      <nav aria-label="Main navigation" className="site-nav">
        {siteConfig.navigation.map((item) => (
          <Link href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>
    </header>
  );
}
