import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(number:any, decimals:number = 0) {
  return parseFloat(number).toFixed(decimals)
}

export function formatSpeed(speed:number) {
  return `${speed} km/h`
}