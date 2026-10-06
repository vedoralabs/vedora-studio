"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavItem {
  readonly label: string;
  readonly href: string;
}

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the menu after navigation.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [toggleRef.current, ...Array.from(panelRef.current.querySelectorAll<HTMLElement>("a"))].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 701px)");
    const onBreakpoint = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main navigation" className="site-nav">
        {items.map((item) => (
          <Link aria-current={isCurrent(pathname, item.href) ? "page" : undefined} href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        aria-controls="site-menu"
        aria-expanded={open}
        className="site-menu-toggle"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((current) => !current);
        }}
        ref={toggleRef}
        type="button"
      >
        <span>{open ? "Close" : "Menu"}</span>
        <span aria-hidden="true" className="site-menu-toggle__mark" data-open={open} />
      </button>
      <div className="site-menu" data-open={open} hidden={!open} id="site-menu" ref={panelRef}>
        <nav aria-label="Menu">
          <ol className="site-menu__list">
            {items.map((item, index) => (
              <li key={item.href}>
                <Link
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <span aria-hidden="true" className="metadata">{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <p className="caption site-menu__note">Photography &amp; visual storytelling</p>
      </div>
    </>
  );
}
