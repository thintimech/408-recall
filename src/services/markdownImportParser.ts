interface ParsedCard {
  front: string
  back: string
}

export function parseMarkdownCards(text: string): ParsedCard[] {
  const cards: ParsedCard[] = []
  const blocks = text.split(/^## Q:/m).slice(1)

  for (const block of blocks) {
    const parts = block.split(/^## A:/m)
    if (parts.length < 2) continue

    const front = parts[0].trim()
    const back = parts.slice(1).join('## A:').trim()
    if (front && back) {
      cards.push({ front, back })
    }
  }

  return cards
}
