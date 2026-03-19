import { motion } from 'framer-motion'
import { FlaskConical, Play, Clock, BarChart3, AlertTriangle } from 'lucide-react'
import { useCrucibleStore } from '@/lib/store'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const RESP_TABS = ['Headers', 'Body'] as const
type RespTab = typeof RESP_TABS[number]

import { useState } from 'react'

function highlightReflections(body: string, input: string): React.ReactNode {
  if (!input || input.trim() === '') return <span>{body}</span>
  const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = body.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === input.toLowerCase() ? (
          <span
            key={i}
            className="bg-purple-core/25 text-purple-bright px-0.5 rounded border border-purple-core/40"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function parseHeaders(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (key) result[key] = val
  }
  return result
}

export function CrucibleView() {
  const { url, method, headers, body, response, loading, setUrl, setMethod, setHeaders, setBody, setResponse, setLoading } = useCrucibleStore()
  const [activeTab, setActiveTab] = useState<RespTab>('Body')

  const handleSend = async () => {
    if (!url || loading) return
    setLoading(true)
    setResponse(null)

    const start = performance.now()
    try {
      const parsedHeaders = parseHeaders(headers)
      const opts: RequestInit = {
        method,
        headers: parsedHeaders,
      }
      if (method !== 'GET' && method !== 'HEAD' && body) {
        opts.body = body
      }

      const res = await fetch(url, opts)
      const elapsed = Math.round(performance.now() - start)
      const text = await res.text()
      const respHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { respHeaders[k] = v })

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: respHeaders,
        body: text,
        durationMs: elapsed,
        sizeBytes: new TextEncoder().encode(text).length,
      })
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start)
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: String(err instanceof Error ? err.message : err),
        durationMs: elapsed,
        sizeBytes: 0,
        error: String(err instanceof Error ? err.message : err),
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColor =
    !response ? 'text-text-tertiary'
    : response.error ? 'text-status-error'
    : response.status < 300 ? 'text-status-success'
    : response.status < 400 ? 'text-status-warning'
    : 'text-status-error'

  const reflectionCount = response?.body
    ? (response.body.match(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden p-6 gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-core/15 border border-violet-dim/50 flex items-center justify-center">
          <FlaskConical size={16} className="text-violet-bright" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold tracking-[0.2em] text-violet-vivid text-glow">
            CRUCIBLE
          </h1>
          <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
            Test Sandbox — Send payloads, capture responses, analyze reflections
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-rows-[auto_1fr] gap-4 min-h-0">
        {/* Request Builder */}
        <div className="glass-card p-4 flex flex-col gap-3">
          {/* Method + URL */}
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-void-800/80 border border-purple-dim/40 rounded-lg px-3 py-2 font-mono text-xs text-purple-bright focus:outline-none focus:border-purple-core/60 transition-colors cursor-pointer shrink-0"
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://target.example.com/search?q="
              className="flex-1 bg-void-800/50 border border-purple-dim/30 rounded-lg px-3 py-2 font-mono text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-core/60 transition-colors"
            />
          </div>

          {/* Headers + Body */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
                Headers (Key: Value, one per line)
              </span>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="bg-void-900/50 border border-purple-dim/20 rounded p-2 font-mono text-[10px] text-text-secondary focus:outline-none focus:border-purple-core/40 transition-colors resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
                Body
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder='{"query": "payload", "limit": 10}'
                className="bg-void-900/50 border border-purple-dim/20 rounded p-2 font-mono text-[10px] text-text-secondary placeholder-text-tertiary focus:outline-none focus:border-purple-core/40 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleSend}
              disabled={loading || !url}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-[9px] tracking-wider transition-all
                ${loading || !url
                  ? 'bg-void-800/50 border border-purple-dim/20 text-text-tertiary cursor-not-allowed'
                  : 'bg-purple-core/20 border border-purple-core/50 text-purple-bright hover:bg-purple-core/30 hover:glow-subtle'
                }`}
            >
              <Play size={11} className="fill-current" />
              {loading ? 'SENDING…' : 'SEND'}
            </button>
          </div>
        </div>

        {/* Response Analyzer */}
        <div className="glass-card flex flex-col overflow-hidden">
          {/* Status line */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-purple-dim/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-tertiary">STATUS:</span>
              <span className={`font-mono text-xs font-bold ${statusColor}`}>
                {response ? `${response.status || 'ERR'} ${response.statusText}` : '—'}
              </span>
            </div>
            {response && (
              <>
                <div className="flex items-center gap-2">
                  <Clock size={11} className="text-text-tertiary" />
                  <span className="font-mono text-[10px] text-text-secondary">{response.durationMs}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={11} className="text-text-tertiary" />
                  <span className="font-mono text-[10px] text-text-secondary">
                    {response.sizeBytes > 1024 ? `${(response.sizeBytes / 1024).toFixed(1)} KB` : `${response.sizeBytes} B`}
                  </span>
                </div>
              </>
            )}
            <div className="ml-auto flex items-center gap-1">
              {RESP_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded font-mono text-[9px] tracking-wider transition-all ${
                    activeTab === tab
                      ? 'bg-purple-core/15 text-purple-bright border border-purple-core/30'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Response body */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
            {loading && (
              <div className="flex items-center gap-2 text-purple-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-core animate-pulse" />
                Sending request…
              </div>
            )}

            {!loading && !response && (
              <div className="text-text-tertiary">Response will appear here after SEND.</div>
            )}

            {!loading && response && activeTab === 'Body' && (
              <div className="text-text-secondary whitespace-pre-wrap break-all">
                {response.error
                  ? <span className="text-status-error">{response.body}</span>
                  : highlightReflections(response.body, url)
                }
              </div>
            )}

            {!loading && response && activeTab === 'Headers' && (
              <div className="flex flex-col gap-1">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-purple-bright">{k}</span>
                    <span className="text-text-tertiary">: </span>
                    <span className="text-text-secondary">{v}</span>
                  </div>
                ))}
                {Object.keys(response.headers).length === 0 && (
                  <span className="text-text-tertiary">No headers captured.</span>
                )}
              </div>
            )}
          </div>

          {/* Analysis panel */}
          {response && !response.error && (
            <div className="border-t border-purple-dim/20 px-4 py-3 shrink-0">
              <div className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase mb-2">
                Analysis
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${reflectionCount > 0 ? 'bg-status-success' : 'bg-text-tertiary'}`} />
                  <span className="text-text-secondary">URL reflected: </span>
                  <span className={reflectionCount > 0 ? 'text-status-success font-bold' : 'text-text-tertiary'}>
                    {reflectionCount > 0 ? `YES (${reflectionCount}x)` : 'NO'}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-status-info shrink-0" />
                  <span className="text-text-secondary">Status: </span>
                  <span className={statusColor}>{response.status}</span>
                </div>
              </div>
              {reflectionCount > 0 && (
                <div className="flex items-start gap-2 mt-2 font-mono text-[10px]">
                  <AlertTriangle size={11} className="text-purple-bright shrink-0 mt-0.5" />
                  <span className="text-purple-bright">URL string reflected in response — check for injection context</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
