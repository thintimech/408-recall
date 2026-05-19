import { describe, expect, it } from 'vitest'
import { addDays, toLocalDateString } from './dateService'

describe('dateService', () => {
  it('formats dates as local YYYY-MM-DD', () => {
    const date = new Date(2026, 4, 9)

    expect(toLocalDateString(date)).toBe('2026-05-09')
  })

  it('adds days across month boundaries', () => {
    expect(addDays('2026-05-30', 2)).toBe('2026-06-01')
  })

  it('adds days across leap-year February', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})
