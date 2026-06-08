import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatHours(hours) {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function formatLessons(lessons) {
  return `${lessons} ${lessons === 1 ? "lesson" : "lessons"}`;
}
