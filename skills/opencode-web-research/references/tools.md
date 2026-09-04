# Web Research Tools — Parameter Reference

One-level reference loaded on demand from `../SKILL.md`. Names are the exact, fully-qualified tool names opencode registers: `<server>_<tool>`. MCP tools expose their full input schema in-session — this file carries the key parameters, defaults, and gotchas worth knowing before the call. If a name doesn't resolve, check the session's tool list for the exact form.

## Table of contents

- [Built-in search — websearch](#built-in-search--websearch)
- [Tavily — tavily_tavily_search and siblings](#tavily--tavily_tavily_search-and-siblings)
- [Serper — serper_search_web and siblings](#serper--serper_search_web-and-siblings)
- [LangSearch — langsearch_langsearch_web_search / langsearch_langsearch_semantic_rerank](#langsearch--langsearch_langsearch_web_search--langsearch_langsearch_semantic_rerank)
- [You.com — you_you-search / -contents / -research](#youcom--you_you-search--contents--research)
- [Firecrawl — firecrawl_firecrawl_scrape and siblings](#firecrawl--firecrawl_firecrawl_scrape-and-siblings)
- [Built-in fetch — webfetch](#built-in-fetch--webfetch)
- [Plugin search — web_search](#plugin-search--web_search)
- [Library docs — context7](#library-docs--context7)
- [Self-hosted docs — docs-mcp-server](#self-hosted-docs--docs-mcp-server)

---

## Built-in search — `websearch`

Default discovery tool. opencode built-in, Exa-backed, enabled via `OPENCODE_ENABLE_EXA` and keyed via `EXA_API_KEY` on this machine (no free-tier rate limit).

| Parameter | Required | Default | Notes |
|-----------|----------|---------|-------|
| `query` | yes | — | Web search query |
| `numResults` | no | `8` | Keep low (3–5) — results carry long highlights |
| `type` | no | `auto` | `auto` (balanced) / `fast` (quick) / `deep` (comprehensive) |
| `livecrawl` | no | `fallback` | `fallback` (live crawl only if cached unavailable) or `preferred` (prioritize live crawl) |
| `contextMaxCharacters` | no | `10000` | Max chars of context per result |

**Gotchas**
- Returns synthesized snippets — still not a substitute for reading the source behind a material claim.
- Verbose: each result carries long, near-full-page highlights — 4 results ≈ 6k tokens. Cap `numResults` at 3–5 and read only the top hits.
- If it errors or returns nothing, move to `tavily_tavily_search`; don't retry the same tool.

## Tavily — `tavily_tavily_search` and siblings

Keyed Tavily MCP (server name `tavily`). Note the double `tavily_tavily_` prefix — correct, with underscores.

`tavily_tavily_search` — content-rich web search.

| Parameter | Required | Default | Notes |
|-----------|----------|---------|-------|
| `query` | yes | — | The search string |
| `search_depth` | no | — | `basic` / `advanced` (slower, better) / `fast` |
| `topic` | no | — | `general` / `news` |
| `max_results` | no | — | ~5 focused, ~10 broad |
| `include_domains` / `exclude_domains` | no | — | Source-trust filtering |

`tavily_tavily_extract` — batch content extraction for known URLs (handles JS rendering, returns clean content). Key param: the URL list.

`tavily_tavily_map` / `tavily_tavily_crawl` — site structure map / systematic multi-page crawl. Rarely needed; for real crawls defer to the `firecrawl-crawl` skill.

**Gotchas**
- Prefer the Search → Extract flow for grounded answers: search for URLs, then extract/read the promising ones.
- `advanced` depth costs more time/quota — use when `basic` results are thin.

## Serper — `serper_search_web` and siblings

Keyed Serper MCP (server name `serper`) — Google SERP data. Tools: `serper_search_web`, `serper_search_news`, `serper_search_images`, `serper_search_videos`, `serper_search_shopping`, `serper_search_places`. Key param on all: `query` (full params in the live schema).

**Gotchas**
- Use when you need **exact Google results/ordering** or a very fresh index — that's its edge over Exa/Tavily.
- `serper_search_news` returns relative timestamps (`4 hours ago`), not absolute dates — open the article or cross-check another source before citing a date.
- `serper_deep_research` exists but requires `GEMINI_API_KEY` (not configured on this machine) — treat as unavailable.
- Community MCP server (`serper-search-mcp` via npx) — if the server fails to start, fall back to `websearch`/`tavily_tavily_search`.

## LangSearch — `langsearch_langsearch_web_search` / `langsearch_langsearch_semantic_rerank`

Keyed LangSearch MCP (server name `langsearch`). Note the double `langsearch_` prefix — correct.

`langsearch_langsearch_web_search` — freshness-filtered search.

| Parameter | Required | Default | Notes |
|-----------|----------|---------|-------|
| `query` | yes | — | 1–500 chars |
| `count` | no | `10` | 1–10; keep low (daily quota) |
| `freshness` | no | `noLimit` | `oneDay` / `oneWeek` / `oneMonth` / `oneYear` / `noLimit` |
| `summary` | no | — | Boolean; leave off by default (costs quota) |
| `response_format` | no | — | `markdown` / `json` |

`langsearch_langsearch_semantic_rerank` — rerank candidate documents against a query. Key params: `query`, `documents` (1–100 strings), `top_n`. Use to triage many candidates before reading anything.

**Gotchas**
- Free-tier daily quota is finite — keep `count` low and don't burn it on vague queries.
- `langsearch_langsearch_semantic_rerank` can error out (500s) — if it fails, triage manually: rank candidates by domain trust + title/query keyword overlap and read the top 3.
- Community MCP server (`langsearch-mcp-server` via npx) — if it fails to start, use `serper_search_news` or `tavily_tavily_search` for freshness needs.

## You.com — `you_you-search` / `-contents` / `-research`

Keyed You.com MCP (server name `you`). Note the double `you_` prefix — correct.

- `you_you-search` — current web search, snippets and source discovery.
- `you_you-contents` — read supplied URLs / promising search results before relying on exact details.
- `you_you-research` — one-shot managed, cited synthesis. Heavier quota cost — reserve for questions that genuinely need multi-source synthesis.

Also registered: `you-free_you-search` (keyless basic search — fallback if the key/quota dies), `you-finance_*` (finance research — route via the `you-finance` skill), `you-docs_searchDocs` (You.com's own docs only).

**Gotchas**
- Prefer the installed `you-web` / `you-research` / `you-finance` skills for anything beyond single tool calls — they own the routing and cost trade-offs.
- All requests hit `https://api.you.com/mcp` with a Bearer key — same no-secrets rule as every other provider.

## Firecrawl — `firecrawl_firecrawl_scrape` and siblings

Keyed Firecrawl MCP (server name `firecrawl`) — note the double `firecrawl_` prefix. Full surface is visible in-session; the research-relevant ones:

- `firecrawl_firecrawl_scrape` — single page → markdown/JSON. Key params: `url`, `formats`, `onlyMainContent`; supports JSON-schema structured extraction.
- `firecrawl_firecrawl_search` — web search with page-content results.
- `firecrawl_firecrawl_map` — discover a site's URLs without crawling.
- `firecrawl_firecrawl_developer_search` — GitHub issues / merged PRs / READMEs / docs index. Good for "was this bug fixed" / "what does this error mean". Scope queries with `repo:owner/name` + a quoted error string — unscoped issue queries return noise.
- `firecrawl_firecrawl_agent` + `firecrawl_firecrawl_agent_status` — async multi-step research (poll status).
- `firecrawl_firecrawl_research_search_papers` etc. — paper index (biomedical + arXiv heavy); route via the `firecrawl-research-papers` skill.

**Gotchas**
- `firecrawl_firecrawl_scrape` may serve cached content — check `cacheState` in the response; pass `maxAge: 0` when a guaranteed live fetch matters.
- Crawls, monitors, lead-gen, interact, and deep-research workflows belong to the `firecrawl-*` skills — don't drive them with raw tool calls from here.
- `firecrawl_firecrawl_parse` is for local files, not URLs.

## Built-in fetch — `webfetch`

Simplest retrieval: URL → markdown. Default for simple pages.

| Parameter | Required | Default | Notes |
|-----------|----------|---------|-------|
| `url` | yes | — | URL to fetch |
| `format` | no | `markdown` | `markdown` / `text` / `html` |
| `timeout` | no | — | Seconds, max 120 |

**Gotchas**
- HTTP URLs auto-upgraded to HTTPS.
- Large pages may be summarized; JS-heavy pages may come back incomplete — that's the signal to switch to `firecrawl_firecrawl_scrape`.

## Plugin search — `web_search`

`opencode-metasearch2` plugin. Local scraper aggregating Google/Bing/Brave. Keyless. **Emergency fallback only.**

| Parameter | Required | Default | Notes |
|-----------|----------|---------|-------|
| `query` | yes | — | The search string |
| `type` | no | `all` | `all` (web) or `images` |

**Gotchas**
- Scrapes public search UIs → CAPTCHA / IP rate-limit risk under heavy or bursty use. Reserve for when every keyed provider is erroring.
- Returns raw JSON: `search_results` (each with `engines` + `score`), `featured_snippet`, `answer`, `infobox`.

## Library docs — `context7`

Authoritative current library/framework/SDK documentation. **Prefer over generic web search for "how do I use X in Y".**

`context7_resolve-library-id`

| Parameter | Required | Notes |
|-----------|----------|-------|
| `query` | yes | What to look up (scoped to one concept; be specific) |
| `libraryName` | yes | Official library name (`Next.js`, `Django`, `Prisma`) |

`context7_query-docs`

| Parameter | Required | Notes |
|-----------|----------|-------|
| `libraryId` | yes | From `context7_resolve-library-id` (or `/org/project` or `/org/project/version`) |
| `query` | yes | A single concept; split multi-concept questions into separate calls |

**Gotchas**
- Do not query more than 3 times per question.
- Good: "How to set up authentication with JWT in Express.js". Bad: "auth".

## Self-hosted docs — `docs-mcp-server`

Versioned docs index. **Conditionally available — probe before relying on it.**

Probe first: `docs-mcp-server_list_libraries` (no params). If the library isn't listed or the call errors, the server is down/unconfigured — skip it.

- `docs-mcp-server_find_version` (`library`, optional `targetVersion`)
- `docs-mcp-server_search_docs` (`library`, `query`, optional `version`, `limit` default 5)
- `docs-mcp-server_fetch_url` (`url`)

**Gotchas**
- `scrape_docs` / `refresh_version` / `remove_docs` mutate the index — only on explicit user request.


