import { getMetaValue, setMetaValue } from '@/db/repositories/metaRepository'

export interface LlmProvider {
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
}

export interface LlmConfig {
  providers: LlmProvider[]
  activeProvider: string
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const CONFIG_KEY = 'llm_config'

const DEFAULT_PROVIDERS: LlmProvider[] = [
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', apiKey: '', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
  { name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: '', models: ['gpt-4o', 'gpt-4o-mini'] },
  { name: '自定义', baseUrl: '', apiKey: '', models: [] }
]

const DEFAULT_CONFIG: LlmConfig = {
  providers: DEFAULT_PROVIDERS,
  activeProvider: 'DeepSeek',
  model: 'deepseek-v4-flash'
}

export async function getLlmConfig(): Promise<LlmConfig> {
  const stored = await getMetaValue<LlmConfig>(CONFIG_KEY)
  if (!stored) return DEFAULT_CONFIG

  const providers = stored.providers?.length
    ? stored.providers.map((p, i) => ({
        ...p,
        models: p.models || DEFAULT_PROVIDERS[i]?.models || []
      }))
    : DEFAULT_PROVIDERS

  return {
    providers,
    activeProvider: stored.activeProvider || DEFAULT_CONFIG.activeProvider,
    model: stored.model || DEFAULT_CONFIG.model
  }
}

export async function saveLlmConfig(config: LlmConfig): Promise<void> {
  await setMetaValue(CONFIG_KEY, config)
}

export function getActiveProvider(config: LlmConfig): LlmProvider | undefined {
  return config.providers.find((p) => p.name === config.activeProvider)
}

export async function chatCompletion(
  messages: ChatMessage[],
  config?: LlmConfig
): Promise<string> {
  const cfg = config || (await getLlmConfig())
  const provider = getActiveProvider(cfg)
  if (!provider?.apiKey) throw new Error('请先在设置中配置当前提供商的 API Key。')
  if (!provider.baseUrl) throw new Error('请先在设置中配置提供商的 Base URL。')

  const url = `${provider.baseUrl.replace(/\/$/, '')}/v1/chat/completions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${text.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function chatCompletionStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  config?: LlmConfig,
  signal?: AbortSignal
): Promise<string> {
  const cfg = config || (await getLlmConfig())
  const provider = getActiveProvider(cfg)
  if (!provider?.apiKey) throw new Error('请先在设置中配置当前提供商的 API Key。')
  if (!provider.baseUrl) throw new Error('请先在设置中配置提供商的 Base URL。')

  const url = `${provider.baseUrl.replace(/\/$/, '')}/v1/chat/completions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.7,
      stream: true
    }),
    signal
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${text.slice(0, 200)}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('无法读取响应流。')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const payload = trimmed.slice(6)
        if (payload === '[DONE]') continue

        try {
          const json = JSON.parse(payload)
          const delta = json.choices?.[0]?.delta?.content || ''
          if (delta) {
            fullText += delta
            onChunk(delta)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullText
}
