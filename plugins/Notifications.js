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

export const NotifyPlugin = async () => {
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
        case "session.idle":
          await send("OpenCode - project_name", "Response ready")
          break
        case "session.error":
          await send("OpenCode - project_name", "Session errored", "high", "warning")
          break
        case "permission.asked":
          await send("OpenCode - project_name", "Needs permission", "high", "lock")
          break
        case "question.asked":
          await send("OpenCode - project_name", "Has a question", "high", "question")
          break
      }
    },
  }
}