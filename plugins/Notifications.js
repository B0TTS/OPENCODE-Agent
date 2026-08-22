const _notifyAlreadyLoaded = globalThis.__opencodeNotifyLoaded
if (!_notifyAlreadyLoaded) {
  globalThis.__opencodeNotifyLoaded = true
}

const USE_SELF_HOSTED = true

const NTFY_CONFIG = {
  self: {
    baseUrl: "https://vmi3326176.tailf94009.ts.net:3000",
    topic: "DevelopmentMain",
    headers: {
      "Authorization": "Basic " + btoa("admin:2121400488"),
    },
  },
  cloud: {
    baseUrl: "https://ntfy.sh",
    topic: "DevelopmentMain_JJNtP3cuYprP62DE",
    headers: {},
  },
}

const childSessions = new Map()

function recordSession(info) {
  if (!info?.id) return
  if (info.parentID) {
    const title = info.title && String(info.title).trim() ? info.title : String(info.id).slice(0, 8)
    childSessions.set(info.id, title)
  } else {
    childSessions.delete(info.id)
  }
}

function isChildSession(sessionID) {
  return !!(sessionID && childSessions.has(sessionID))
}

function childTitle(sessionID) {
  return sessionID ? childSessions.get(sessionID) : undefined
}

export const NotifyPlugin = async () => {
  if (_notifyAlreadyLoaded) return {}

  const config = USE_SELF_HOSTED ? NTFY_CONFIG.self : NTFY_CONFIG.cloud

  const send = async (title, body, priority = "default", tags = "robot") => {
    try {
      await fetch(`${config.baseUrl}/${config.topic}`, {
        method: "POST",
        body,
        headers: {
          "Title": title,
          "Priority": priority,
          "Tags": tags,
          ...config.headers,
        },
      })
    } catch {}
  }

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "session.created":
        case "session.updated":
          recordSession(event.properties?.info)
          break
        case "session.idle": {
          const sessionID = event.properties?.sessionID
          if (isChildSession(sessionID)) return
          await send("OpenCode - project_name", "Response ready")
          break
        }
        case "session.error": {
          const sessionID = event.properties?.sessionID
          if (isChildSession(sessionID)) {
            const title = childTitle(sessionID)
            await send("OpenCode - project_name", `Subagent "${title}" errored`, "high", "warning")
            return
          }
          await send("OpenCode - project_name", "Session errored", "high", "warning")
          break
        }
        case "permission.asked": {
          const sessionID = event.properties?.sessionID
          if (isChildSession(sessionID)) {
            const title = childTitle(sessionID)
            await send("OpenCode - project_name", `Subagent "${title}" needs permission`, "high", "lock")
            return
          }
          await send("OpenCode - project_name", "Needs permission", "high", "lock")
          break
        }
        case "question.asked": {
          const sessionID = event.properties?.sessionID
          if (isChildSession(sessionID)) {
            const title = childTitle(sessionID)
            await send("OpenCode - project_name", `Subagent "${title}" has a question`, "high", "question")
            return
          }
          await send("OpenCode - project_name", "Has a question", "high", "question")
          break
        }
      }
    },
  }
}