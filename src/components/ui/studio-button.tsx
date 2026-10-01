import type { ButtonHTMLAttributes } from "react";

type StudioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "quiet";
};

export function StudioButton({ children, className, variant = "solid", type = "button", ...props }: StudioButtonProps) {
  const classes = ["studio-button", `studio-button--${variant}`, className].filter(Boolean).join(" ");
  return <button className={classes} type={type} {...props}>{children}</button>;
}
