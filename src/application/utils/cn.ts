import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge tailwind classes safely
 * Combines clsx and tailwind-merge for powerful class name generation
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
