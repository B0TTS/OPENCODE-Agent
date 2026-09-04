---
name: opencode-web-research
description: ONLY for opencode agents — pi and other harnesses have their own web-access skills. Conducts web research in opencode using its web tools — built-in websearch (Exa), Tavily, Serper, LangSearch, You.com, and Firecrawl MCP servers, plus webfetch, context7, and docs-mcp-server — to discover sources, read pages, look up current library/API docs, and synthesize answers with citations. Use when a task needs current info, news, prices, events, recent framework/library docs, or content from specific URLs, or when you'd otherwise have to say info is past your knowledge cutoff. Routes job-first — Exa websearch by default, Tavily for content-rich results and domain filters, Serper for Google-exact SERP and news, LangSearch for freshness-filtered queries, You.com for cited synthesis, Firecrawl for JS-heavy scraping and site maps. NOT for editing code, local filesystem-only work, submitting secrets/PII to search providers, or treating a search snippet as a substitute for reading the source behind a material claim.
---

# Web Research (opencode)

Conduct web research in opencode: discover sources, read pages, look up current library/API docs, and synthesize with citations. Route by job, not by guess — the harness has many search tools and mixing them up is the top failure mode. Per-tool parameters and gotchas live in `references/tools.md`.

## Critical rules (read first)

1. **Use exact tool names.** opencode registers MCP tools as `<server>_<tool>` — server `tavily` + tool `tavily_search` → `tavily_tavily_search` (the double prefix is correct, like `langsearch_langsearch_web_search`; the separator follows the server's own tool naming — You.com tools use hyphens, e.g. `you_you-search`). If a name doesn't resolve, check the session's tool list for the exact form before retrying.
2. **A search snippet is discovery evidence, not a source.** Read the page behind any material claim before citing it. Never infer the content of an unread page.
3. **Never submit secrets, API keys, or PII** to any search tool — queries and URLs reach external hosted providers.
4. **Context budget — snippet-first.** Search, read only the 1–3 most promising pages, paginate long pages instead of pulling everything into context.
5. **Defer big workflows to their skills.** Single tool calls route here; multi-step Firecrawl workflows (crawls, monitoring, deep research, lead-gen) belong to the `firecrawl-*` skills, and You.com workflows to `you-web` / `you-research` / `you-finance` / `you-discover`. Don't duplicate their guidance.

## Discovery (URL unknown)

| Job | First tool | Then |
|---|---|---|
| Default search (dev, general) | `websearch` (Exa, built-in) | `tavily_tavily_search` |
| Google-exact SERP / fresh index | `serper_search_web` | `websearch` |
| News / current events | `serper_search_news` | `tavily_tavily_search` |
| Freshness-filtered (last day/week/month) | `langsearch_langsearch_web_search` | `serper_search_news` |
| Content-rich results, domain filters, depth | `tavily_tavily_search` | `websearch` |
| Breadth before cited synthesis | `you_you-search` | `websearch` |
| Emergency (providers erroring / empty) | `web_search` (metasearch2 plugin) | — |

Routing notes:

- `websearch` is the default: built-in, Exa-backed, keyed on this machine (no free-tier rate limit), no MCP round-trip. Cap `numResults` at 3–5 — its results carry long highlights that flood context.
- If the first tool errors or returns nothing, move to the next tool in the row — don't retry the same one.
- Vary keywords/angles across queries; add an exact product/error/quoted phrase to one of them.

## Retrieval (URL known)

| Page type | Tool | Why |
|---|---|---|
| Simple page | `webfetch` | Simplest, no MCP round-trip |
| JS-heavy, anti-bot, structured extraction | `firecrawl_firecrawl_scrape` | Renders JS, parses to markdown/JSON |
| PDF (text, no OCR) | `firecrawl_firecrawl_scrape` | Handles PDFs; `webfetch` may not |
| Several URLs at once | `tavily_tavily_extract` | Batch extraction, clean content |
| Site structure / find URLs | `firecrawl_firecrawl_map` or `tavily_tavily_map` | Link maps without a full crawl |
| Whole-site ingestion | `firecrawl-crawl` skill (or `tavily_tavily_crawl`) | Defer to the skill for crawls |

## Synthesis and triage

- **One-shot cited synthesis:** `you_you-research` — managed multi-source research with citations.
- **Async multi-step research:** `firecrawl_firecrawl_agent` (poll with `firecrawl_firecrawl_agent_status`). For full workflows use the `firecrawl-deep-research` skill.
- **Rank many candidates before reading:** `langsearch_langsearch_semantic_rerank` — rerank up to 100 snippets/docs against the question. If it errors, triage manually — rank by domain trust + keyword overlap and read the top 3.
- **Papers / literature:** `firecrawl-research-papers` skill (biomedical + arXiv heavy index).

## Library / API / framework docs (lib known)

| Need | Tool |
|---|---|
| Current docs for a library/framework | `context7_resolve-library-id` → `context7_query-docs` |
| GitHub issues / PRs / READMEs about a lib | `firecrawl_firecrawl_developer_search` |
| Versioned self-hosted docs (only if indexed) | `docs-mcp-server_find_version` → `docs-mcp-server_search_docs` |

`context7` stays authoritative for "how do I use X in library Y" — prefer it over generic search. `docs-mcp-server` is conditionally available (offline some sessions) — probe with `docs-mcp-server_list_libraries` before relying on it.

## Workflow

1. **Classify the request:** discovery (find sources), retrieval (read specific URLs), docs lookup (specific library/API), or full research (some of each). Decide breadth from the stakes — one good source for a debugging question, several for a comparative decision.
2. **Discover** with the routing table above when the URL is unknown. If results are weak, refine one constraint at a time: drop words → drop freshness → broaden language → split the question. Retries of the same tool don't help.
3. **Read the sources behind material claims** — snippets aren't enough. Use the retrieval table; paginate long pages to bound context.
4. **Library/API question?** `context7` before generic search; `firecrawl_firecrawl_developer_search` for issue-level detail.
5. **Synthesize with citations.** Cite canonical URLs next to the claims they support. Distinguish evidence (read + supports) vs inference vs unknown. If sources conflict, report the disagreement (freshness/scope/method) — don't silently pick the convenient one.
6. **Stop when the question is answered**, not when a coverage target is met. Say "unknown" explicitly when evidence is missing instead of guessing.

## Checklist (copy into your reply, tick each)

- [ ] Exact tool names used (checked the `<server>_<tool>` form)
- [ ] Routed by job; Exa `websearch` first for default discovery
- [ ] Read every page cited for a material claim (not just snippets)
- [ ] No secrets/PII submitted to any search tool
- [ ] Citations on claims; source conflicts surfaced, not hidden
- [ ] Said "unknown" where evidence was missing
- [ ] Context bounded (paginated instead of dumping whole pages)

## Per-tool parameter reference

See `references/tools.md` for each tool's key parameters, defaults, and gotchas. Full input schemas are visible on the MCP tools themselves in-session.

Setup rationale (env vars, MCP config, auth paths): `b0ttsagent/research/opencode-webstack/`.
