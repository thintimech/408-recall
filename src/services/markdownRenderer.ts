import MarkdownIt from 'markdown-it'
import { katex as katexPlugin } from '@mdit/plugin-katex'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: true
})

md.use(katexPlugin, {
  allowInlineWithSpace: true,
  mathFence: true
})

export function renderMarkdown(content: string): string {
  if (!content) return ''
  return md.render(content)
}

export function renderMarkdownInline(content: string): string {
  if (!content) return ''
  return md.renderInline(content)
}
