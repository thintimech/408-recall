import { db } from '@/db'
import { nowIso } from '@/services/dateService'
import type { ID, MistakeNote } from '@/types/domain'
import { createId } from '@/utils/id'

export async function listMistakeNotes(): Promise<MistakeNote[]> {
  const notes = await db.mistakeNotes.toArray()
  return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getMistakeNote(id: ID): Promise<MistakeNote | undefined> {
  return db.mistakeNotes.get(id)
}

export async function createMistakeNote(
  data: Omit<MistakeNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MistakeNote> {
  const now = nowIso()
  const note: MistakeNote = {
    ...data,
    id: createId('mistake'),
    createdAt: now,
    updatedAt: now
  }
  await db.mistakeNotes.add(note)
  return note
}

export async function updateMistakeNote(note: MistakeNote): Promise<void> {
  await db.mistakeNotes.put({ ...note, updatedAt: nowIso() })
}

export async function deleteMistakeNote(id: ID): Promise<void> {
  await db.mistakeNotes.delete(id)
}

export async function linkCardToMistake(noteId: ID, cardId: ID): Promise<void> {
  const note = await db.mistakeNotes.get(noteId)
  if (!note) return
  if (note.relatedCardIds.includes(cardId)) return
  await db.mistakeNotes.put({
    ...note,
    relatedCardIds: [...note.relatedCardIds, cardId],
    updatedAt: nowIso()
  })
}
