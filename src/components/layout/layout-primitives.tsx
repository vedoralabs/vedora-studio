import type { HTMLAttributes, ReactNode } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

function withClass(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function Container({ children, className, size = "wide", ...props }: DivProps & { size?: "wide" | "copy" }) {
  return <div className={withClass(`container${size === "copy" ? " container--copy" : ""}`, className)} {...props}>{children}</div>;
}

export function Section({ children, className, spacing = "default", ...props }: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  spacing?: "default" | "compact";
}) {
  return <section className={withClass(`section${spacing === "compact" ? " section--compact" : ""}`, className)} {...props}>{children}</section>;
}

export function FullBleed({ children, className, ...props }: DivProps) {
  return <div className={withClass("full-bleed", className)} {...props}>{children}</div>;
}

export function Stack({ children, className, density = "regular", ...props }: DivProps & {
  density?: "tight" | "regular" | "loose";
}) {
  const modifier = density === "regular" ? "" : ` stack--${density}`;
  return <div className={withClass(`stack${modifier}`, className)} {...props}>{children}</div>;
}

export function Cluster({ children, className, ...props }: DivProps) {
  return <div className={withClass("cluster", className)} {...props}>{children}</div>;
}

export function EditorialGrid({ children, className, ...props }: DivProps) {
  return <div className={withClass("editorial-grid", className)} {...props}>{children}</div>;
}

export function SplitLayout({ children, className, ...props }: DivProps) {
  return <div className={withClass("split-layout", className)} {...props}>{children}</div>;
}
