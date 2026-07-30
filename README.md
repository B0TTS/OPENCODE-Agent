# Setup

### Docker

**1. Create and start the Docker workspace:**

   ```bash
docker run -it \
  --name project_name \
  -v "C:\_Project_Directory:/workspace" \
  -w /workspace \
  -p 58741:58741 \
  -p 2222:22 \
  ghcr.io/anomalyco/opencode
   ```

(Flatten that to a single line using an AI chat or Docker Gordon, then run it.)

**2. Enter the container:**

```bash
docker exec -it project_name sh
```

**2.1 Find your container** (if you forgot the name):

```bash
docker ps
```

### Install Dependencies

**1. Node.js:**

```bash
apk add nodejs npm
```

**2. Git:**

```bash
apk add git
```

### OpenSSH (Remote Access)

**1. Install OpenSSH server:**

```bash
apk add openssh-server
```

**2. Generate host keys:**

```bash
ssh-keygen -A
```

**3. Enable root login with password — append to `/etc/ssh/sshd_config`:**

```bash
echo -e "PermitRootLogin yes\nPasswordAuthentication yes" >> /etc/ssh/sshd_config
```

**4. Set root password:**

```bash
passwd root
```

**5. Start SSH server:**

```bash
/usr/sbin/sshd
```

### Auto-Start SSH on Container Restart

After completing all setup above (dependencies, OpenSSH, tmux), save the container as an image so SSH auto-starts on future `docker start`:

**1. Exit the container:**

```bash
exit
```

**2. Save the container as an image:**

```bash
docker commit project_name project_name-image
```

**3. Remove the old container:**

```bash
docker stop project_name && docker rm project_name
```

**4. Run a new container from the saved image:**

```bash
docker run -it \
  --name project_name \
  -v "C:\_Project_Directory:/workspace" \
  -w /workspace \
  -p 58741:58741 \
  -p 2222:22 \
  --entrypoint sh \
  project_name-image \
  -c "/usr/sbin/sshd && exec sh"
```

(Flatten that to a single line using an AI chat or Docker Gordon, then run it.)

**Note:** If you install new packages later, re-run step 2 to update the image:

```bash
docker commit project_name project_name-image
```

### tmux + Termius (Persistent Sessions)

**1. Install tmux:**

```bash
apk add tmux
```

**2. Create a named session:**

```bash
tmux new-session -d -s main
```

**3. Auto-attach on login — append to `~/.profile`:**

```bash
if command -v tmux &>/dev/null && [ -z "$TMUX" ]; then
  tmux attach -t main 2>/dev/null || tmux new -s main
fi
```

(Flatten that to a single line using an AI chat or Docker Gordon, then run it.)

**4. Connect from Termius (phone):**

| Field    | Value                    |
| -------- | ------------------------ |
| Host     | Your Windows PC local IP |
| Port     | 2222                     |
| User     | root                     |
| Password | *(the one you set)*      |

Run `ipconfig` on Windows to find your local IP.

**5. Using tmux from phone:**

- `tmux ls` — list sessions
- `tmux attach -t main` — attach to session
- `Ctrl+B, D` — detach (keeps session running)

### GSD

**1. Install GSD:**

```
npx @opengsd/gsd-core@latest
```

**2. Install GSD SDK globally**

```
npm install -g @gsd-build/sdk
```

**Note:** you can also just ask the model to do it, so you don't have to reinstall every session.

**3. Configure model overrides** — paste into `.opencode/opencode.json` under `"agent"`.
For other override strategies, see `C:\Users\Jonah\.config\opencode\Model Overrides\model-override-strategies.md`.

### opencode MCPs

**1. Roblox Studio MCP** (read-only inspector) — browse the live place file from AI. Add to `.opencode/opencode.json`:

```json
"mcp": {
  "robloxstudio": {
    "type": "local",
    "command": ["npx", "-y", "robloxstudio-mcp-inspector@latest"],
    "enabled": true,
    "timeout": 30000
  }
}
```

**1.1 - Requirements:** Enable `HTTP Requests` in Roblox Studio (`File > Game Settings > Security`).

**2. Context7 MCP** — Roblox/Luau documentation lookups. Add to `.opencode/opencode.json`:

```json
"mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
      },
      "enabled": true
    }
}
```

Then set the env var: `export CONTEXT7_API_KEY=ctx7sk-...`

### Notifications

Push notifications via [ntfy.sh](https://ntfy.sh) when the AI finishes, needs permission, or errors.

**1.** Create a `plugins` folder inside `.opencode/` in your project.

**2.** Copy `Notifications.js` from `C:\Users\Jonah\.config\opencode\Plugins\Notifications.js` into `.opencode/plugins/`.

**3.** Update placeholders in `.opencode/plugins/Notifications.js`:

- Replace the ntfy topic URL with your own (get one at [ntfy.sh](https://ntfy.sh)).
- Replace `project_name` in the title strings.

**4.** Subscribe — install the ntfy app ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iOS](https://apps.apple.com/app/ntfy/id1625396347)) and subscribe to your topic.

### Cleanup

**Remove a specific project:**

```bash
docker stop project_name && docker rm project_name
docker rmi project_name-image
```

**Remove all unused images and containers:**

```bash
docker system prune
```

</instructions>