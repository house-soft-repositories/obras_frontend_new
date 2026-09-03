import type { ComponentProps } from "react";
import { cn } from "@/core/ui/cn";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

const headingClasses: Record<HeadingLevel, string> = {
  h1: "font-display text-4xl leading-12 font-semibold tracking-tight text-foreground",
  h2: "font-display text-3xl leading-10 font-semibold tracking-tight text-foreground",
  h3: "font-display text-2xl leading-8 font-semibold text-foreground",
  h4: "font-display text-xl leading-7 font-semibold text-foreground",
};

export interface HeadingProps extends ComponentProps<"h1"> {
  as?: HeadingLevel;
}

export function Heading({ as: Tag = "h1", className, ...props }: HeadingProps) {
  return (
    <Tag
      data-slot="heading"
      className={cn(headingClasses[Tag], className)}
      {...props}
    />
  );
}

export function Body({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="body"
      className={cn("text-sm leading-5 text-foreground", className)}
      {...props}
    />
  );
}

export function Caption({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="caption"
      className={cn("text-xs leading-4 text-muted", className)}
      {...props}
    />
  );
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "font-mono text-[11px] leading-4 font-semibold tracking-[0.16em] text-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}
