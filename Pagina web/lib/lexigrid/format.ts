export const DAY = 86_400_000
export const MIN = 60_000

const pad = (n: number) => String(n).padStart(2, '0')

export function fmtDate(t: number) {
  const d = new Date(t)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function fmtTime(t: number) {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtDateTime(t: number) {
  return `${fmtDate(t)} ${fmtTime(t)}`
}

export function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
