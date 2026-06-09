# Ashby MCP

Connect your Ashby recruiting data to Claude. Once set up, you can ask Claude things like:

- *"Show me all active applications for the Engineering Manager role"*
- *"Search for candidate Jane Smith"*
- *"What interview stages does this job have?"*
- *"List all open job postings"*

---

## What you'll need

1. **Node.js** installed on your computer — download it at [nodejs.org](https://nodejs.org) (click the big green "LTS" button)
2. **An Ashby API key** — go to Ashby → Settings → Integrations → API Keys → Create a new key
3. **Claude Desktop** — download at [claude.ai/download](https://claude.ai/download)

---

## Setup (5 minutes)

### Step 1 — Download this project

Click the green **Code** button at the top of this page, then click **Download ZIP**. Unzip it somewhere easy to find, like your Desktop.

### Step 2 — Install dependencies

Open **Terminal** (press `Cmd + Space`, type "Terminal", press Enter) and run:

```
cd ~/Desktop/ashby-mcp
npm install
```

### Step 3 — Connect to Claude Desktop

Open this file in a text editor:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

> **Tip:** In Finder, press `Cmd + Shift + G`, paste the path above, and press Go.

Add the following inside the file. If the file already has content, add this inside the `"mcpServers"` section:

```json
{
  "mcpServers": {
    "ashby": {
      "command": "node",
      "args": ["/Users/YOUR_NAME/Desktop/ashby-mcp/index.js"],
      "env": {
        "ASHBY_API_KEY": "paste-your-api-key-here"
      }
    }
  }
}
```

Replace `YOUR_NAME` with your Mac username and paste your Ashby API key where indicated.

### Step 4 — Restart Claude Desktop

Quit Claude Desktop completely and reopen it. You're ready to go!

---

## What can it do?

| Ask Claude about... | Examples |
|---|---|
| **Candidates** | Search, view, create candidates; add notes and tags |
| **Applications** | List, filter, and move applications through stages |
| **Jobs** | Search and view job details |
| **Job Postings** | See published, draft, or closed postings |
| **Interviews** | View and cancel interview schedules |
| **Offers** | List and view offer details |
| **Your team** | Look up users and departments |

---

## Need help?

Open an issue on this GitHub page and describe what's going wrong — include any error messages you see.
OR
Email me - Jake (dot) teagle (at) v7labs.com
