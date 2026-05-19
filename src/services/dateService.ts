import type { ISODateString, ISODateTimeString } from '@/types/domain'

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function parseLocalDate(date: ISODateString): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toLocalDateString(date: Date): ISODateString {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayLocalDate(): ISODateString {
  return toLocalDateString(new Date())
}

export function addDays(date: ISODateString, days: number): ISODateString {
  const value = parseLocalDate(date)
  value.setDate(value.getDate() + days)
  return toLocalDateString(value)
}

export function nowIso(): ISODateTimeString {
  return new Date().toISOString()
}
