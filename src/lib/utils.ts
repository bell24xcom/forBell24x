// Minimal utils stub
export function clsx(...args: any[]) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
}

export function cn(...inputs: any[]) {
  return clsx(...inputs)
}
