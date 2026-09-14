import { twMerge } from "tailwind-merge";

export function cn(...classNames: Array<string | false | null | undefined>) {
  return twMerge(classNames.filter(Boolean));
}
