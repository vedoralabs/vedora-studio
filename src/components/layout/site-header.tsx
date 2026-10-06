import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link aria-label="Vedora Studio home" className="wordmark" href="/">
        {siteConfig.brand}
      </Link>
      <SiteNav items={siteConfig.navigation} />
    </header>
  );
}
