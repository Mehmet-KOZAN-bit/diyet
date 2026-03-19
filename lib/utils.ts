// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate an initials placeholder
export function getInitials(name: string) {
  return name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}
