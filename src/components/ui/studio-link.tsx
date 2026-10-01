import Link from "next/link";
import type { ComponentProps } from "react";

type StudioLinkProps = ComponentProps<typeof Link> & {
  variant?: "text" | "solid" | "outline";
};

export function StudioLink({ children, className, variant = "text", ...props }: StudioLinkProps) {
  const classes = [variant === "text" ? "text-link" : `studio-link--button studio-link--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return <Link className={classes} {...props}>{children}</Link>;
}
