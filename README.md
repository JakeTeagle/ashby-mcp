# ashby-mcp

An MCP (Model Context Protocol) server for the [Ashby](https://ashbyhq.com) ATS API. Exposes Ashby recruiting data and actions as tools for use with Claude and other MCP-compatible AI clients.

## Tools

**Candidates**
- `candidate_search` — search by email or name
- `candidate_list` — paginated list of all candidates
- `candidate_info` — details for a specific candidate
- `candidate_create` — create a new candidate
- `candidate_create_note` — add a note to a candidate
- `candidate_add_tag` — tag a candidate

**Applications**
- `application_list` — paginated list with filters (job, status)
- `application_info` — details for a specific application
- `application_change_stage` — move to a different interview stage
- `application_update` — update custom fields or source
- `application_feedback_list` — list feedback for an application

**Jobs**
- `job_list` — paginated list of all jobs
- `job_info` — details for a specific job
- `job_search` — search by title

**Job Postings**
- `job_posting_list` — list public postings with status filter
- `job_posting_info` — details for a specific posting

**Interview Schedules**
- `interview_schedule_list` — paginated list, filterable by application
- `interview_schedule_cancel` — cancel a schedule
- `interview_stage_list` — list stages, optionally filtered by job

**Offers**
- `offer_list` — paginated list of all offers
- `offer_info` — details for a specific offer

**Users & Org**
- `user_list` — list all users
- `user_search` — search by email or name
- `department_list` — list departments
- `source_list` — list candidate sources
- `candidate_tag_list` — list available tags
- `custom_field_list` — list custom fields by object type

## Setup

### Prerequisites
- Node.js 18+
- An Ashby API key (Settings → Integrations → API Keys)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/ashby-mcp.git
cd ashby-mcp
npm install
```

### Configure with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ashby": {
      "command": "node",
      "args": ["/absolute/path/to/ashby-mcp/index.js"],
      "env": {
        "ASHBY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Configure with Claude Code

```bash
ASHBY_API_KEY=your-api-key-here node /path/to/ashby-mcp/index.js
```

Or add it via the Claude Code MCP settings.

## License

ISC
