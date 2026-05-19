import { db } from '@/db'
import { nowIso } from '@/services/dateService'

export async function getMetaValue<T>(key: string): Promise<T | undefined> {
  const entry = await db.appMeta.get(key)
  return entry?.value as T | undefined
}

export async function setMetaValue(key: string, value: unknown): Promise<void> {
  await db.appMeta.put({
    key,
    value,
    updatedAt: nowIso()
  })
}
