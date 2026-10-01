export const siteConfig = {
  name: "Vedora Studio",
  brand: "VEDORA STUDIO",
  description:
    "A photography and visual storytelling studio shaping thoughtful imagery for people, brands, and places.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vedora.studio",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  socialLinks: [] as readonly { label: string; href: string }[],
  themeColor: "#111110",
  locale: "en_US",
  navigation: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;
