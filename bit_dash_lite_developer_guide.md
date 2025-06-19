# BitDash‑Lite: Junior Developer Playbook

*(Lean 5‑min BTC signal dashboard with Windsurf IDE & Codex)*

---

## 1 · Overview

This document consolidates **all setup steps**, **file stubs**, **configuration**, and **prompts** needed to bootstrap and autonomously build BitDash‑Lite. Hand this to a junior dev or AI agent; merge no more than **900 LOC**, **no new runtime deps**, **300 LOC max per PR**.

## 2 · Tech Stack

- **Next.js 14** (app router, TS)
- **Tailwind CSS**
- **lightweight‑charts** + **react‑use** + **mitt** + **dayjs**
- **Jest** & **@testing-library/react**
- **Playwright** for visual tests

## 3 · Repo Scaffold

```bash
# Create empty GitHub repo, then locally:
git clone git@github.com:gevans3000/bitdash-lite.git
cd bitdash-lite

# Bootstrap Next + Tailwind + TS
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir

# Enable pnpm and install runtime deps
corepack enable
pnpm add lightweight-charts react-use mitt dayjs

# Install test deps
pnpm add -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest playwright @playwright/test
```

---

## 4 · Essential Config & Stub Files

Create **four dotfiles** and **multiple stubs** so the project compiles before Codex tasks fill them in.

### 4.1 · `.windsurf.yml`

```yaml
name: BitDash-Lite
image: node:18-bullseye
ports:
  - { port: 3000, visibility: public }
dev:
  setup:
    - corepack enable
    - pnpm install --frozen-lockfile
  command: pnpm dev
tasks:
  test: pnpm test
  lint: pnpm lint
  build: pnpm build
```

### 4.2 · `.codex-init.json`

```json
{
  "runtime": "node18",
  "package_manager": "pnpm",
  "test_command": "pnpm test",
  "lint_command": "pnpm lint",
  "allow_internet": false,
  "auto_merge": true,
  "feature_flags": { "max_lines_added_per_pr": 300 }
}
```

### 4.3 · `.codex-tasks.json`

```json
[
  {
    "id":"01-indicators",
    "title":"Add SMA20 · RSI14 · MACD(12/26/9)",
    "context":["src/lib/indicators.ts"],
    "edit":["≤120 LOC pure‑TS maths; no new deps"],
    "tests":["indicators.test.ts fixtures"],
    "success":"pnpm test green"
  },
  {
    "id":"02-provider-api",
    "title":"Coinbase 5 m REST + Kraken fallback",
    "context":["src/data/**/*.ts","src/app/api/candles/route.ts"],
    "edit":["≤120 LOC; return 300 candles"],
    "tests":["mock fetch, expect fallback path"],
    "success":"route 200; pnpm test green"
  },
  {
    "id":"03-dashboard-ui",
    "title":"MarketChart · PriceCard · SignalCard UI",
    "context":["src/components/*","src/app/page.tsx"],
    "edit":["draw candles+SMA; price & 24 h Δ; BUY/SELL/HOLD"],
    "tests":["Playwright loads chart"],
    "success":"Lighthouse mobile main‑thread <75 ms"
  }
]
```

### 4.4 · `jest.config.js`

```js
const nextJest = require('next/jest')
module.exports = nextJest({ dir: './' })({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
})
```

### 4.5 · `jest.setup.js`

```js
import '@testing-library/jest-dom';
```

### 4.6 · `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({ webServer: null });
```

### 4.7 · `tests/indicators.test.ts`

```ts
test('placeholder', () => expect(true).toBe(true));
```

### 4.8 · `tsconfig.json` path alias

```diff
 {
   "compilerOptions": {
-    ...
+    baseUrl: ".",
+    paths: { "@/*": ["src/*"] },
     ...
 }
```

### 4.9 · `package.json` scripts

```diff
 "scripts": {
-  "dev": "next dev",
+  "dev": "next dev",
   "build": "next build",
   "start": "next start",
-  "lint": "next lint",
-  "test": ""
+  "lint": "next lint",
+  "test": "jest"
 }
```

### 4.10 · Stub code files

Create the following stubs so TypeScript/Next builds before real code:

```ts
// src/lib/indicators.ts
export function sma20(){return null as any;}
export function rsi14(){return null as any;}
export function macd12269(){return {macd:null,signal:null,histogram:null};}
```

```ts
// src/lib/signals.ts
export type Signal = 'BUY'|'SELL'|'HOLD';
export function getSignal():Signal{return 'HOLD';}
```

```ts
// src/lib/types.ts
export interface Candle{time:number;open:number;high:number;low:number;close:number;volume?:number;}
```

```ts
// src/data/coinbase.ts & src/data/kraken.ts
export async function fetchCandles(){return [];} export const subscribeCandles=()=>()=>{};
```

```ts
// src/app/api/candles/route.ts
import { fetchCandles as cb } from '@/data/coinbase';import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json(await cb());}
```

```tsx
// src/components/... stubs
export default function Stub(){return null;}
```

---

## 5 · Initial Commands

In **Windsurf terminal**:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev   # preview server
pnpm test  # placeholder tests pass
```

---

## 6 · Windsurf Usage

- **Open** project in Windsurf IDE; it auto‑reads `.windsurf.yml`.
- **Dev server**: click **dev** task or `pnpm dev`.
- **Tests**: click **test** or `pnpm test`.
- **Build**: click **build** or `pnpm build`.

---

## 7 · Codex Prompt

In **ChatGPT Teams**, paste once:

> **“Run the ****\`\`**** queue from top to bottom.**\
> **• Strict cap: +300 LOC per PR.**\
> **• No new runtime dependencies.**\
> **• Jest coverage ≥ 80 %.**\
> **Merge automatically when CI is green.”**

Codex will:

1. Branch & implement Task 01 → PR → CI → merge.
2. Repeat for Task 02 & 03.

---

## 8 · Lean‑Code Guardrails

- `.codex-init.json` enforces `max_lines_added_per_pr: 300`.
- **ESLint** and **type-check** errors fail CI (Next’s built-in).
- **PR template** (see next) ensures LOC and deps limits.
- Optionally add Danger, Husky, & pr-size-limit for extra enforcement.

---

## 9 · PR Template & Contributing

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```md
### Summary

### Checklist
- [ ] LOC added ≤ 300
- [ ] No new runtime dependencies
- [ ] Tests & docs updated
- [ ] Lighthouse mobile main-thread < 75 ms
```

Add `CONTRIBUTING.md` section:

```md
## Lean Code Guidelines
- ≤ 300 LOC per PR
- No new runtime deps
- Max 250 lines/file, 50 lines/function
```

---

## 10 · Next Steps

1. **Commit** all new files and stubs:
   ```bash
   ```

git add . && git commit -m "chore: bootstrap scaffold & Codex configs" git push -u origin main

```
2. **Open** Windsurf → confirm `pnpm dev` & `pnpm test` pass.  
3. **Trigger** Codex with the prompt above.  
4. **Review & merge** tiny PRs.  
5. **Monitor** deployment on Vercel or netlify.  

---

**Citation:** See the Codex capabilities & CI/CD automation guide for deep context fileciteturn10file0.  

```
