import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const ASHBY_API_BASE = "https://api.ashbyhq.com";
const API_KEY = process.env.ASHBY_API_KEY;

if (!API_KEY) {
  console.error("Error: ASHBY_API_KEY environment variable is required");
  process.exit(1);
}

const authHeader = "Basic " + Buffer.from(`${API_KEY}:`).toString("base64");

async function ashbyRequest(endpoint, body = {}) {
  const response = await fetch(`${ASHBY_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json; version=1",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.success) {
    const err = data.errorInfo || {};
    throw new Error(`Ashby API error [${err.code || response.status}]: ${err.message || "Unknown error"}`);
  }

  return data;
}

const server = new McpServer({
  name: "ashby-mcp",
  version: "1.0.0",
});

// ─── Candidates ────────────────────────────────────────────────────────────────

server.tool(
  "candidate_search",
  "Search for candidates by email address or name",
  {
    email: z.string().optional().describe("Email address to search for"),
    name: z.string().optional().describe("Name to search for"),
  },
  async ({ email, name }) => {
    const body = {};
    if (email) body.email = email;
    if (name) body.name = name;
    const data = await ashbyRequest("candidate.search", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "candidate_list",
  "List all candidates with optional pagination",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    syncToken: z.string().optional().describe("Sync token for incremental sync"),
  },
  async ({ cursor, limit, syncToken }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (syncToken) body.syncToken = syncToken;
    const data = await ashbyRequest("candidate.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              candidates: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
              syncToken: data.syncToken,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "candidate_info",
  "Get detailed information about a specific candidate",
  {
    candidateId: z.string().describe("The ID of the candidate"),
  },
  async ({ candidateId }) => {
    const data = await ashbyRequest("candidate.info", { id: candidateId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "candidate_create",
  "Create a new candidate",
  {
    name: z.string().describe("Full name of the candidate"),
    email: z.string().optional().describe("Email address"),
    phoneNumber: z.string().optional().describe("Phone number"),
    linkedInUrl: z.string().optional().describe("LinkedIn profile URL"),
    websiteUrl: z.string().optional().describe("Personal website URL"),
    sourceId: z.string().optional().describe("ID of the candidate source"),
    location: z
      .object({
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
      })
      .optional()
      .describe("Candidate location"),
  },
  async ({ name, email, phoneNumber, linkedInUrl, websiteUrl, sourceId, location }) => {
    const body = { name };
    if (email) body.email = email;
    if (phoneNumber) body.phoneNumber = phoneNumber;
    if (linkedInUrl) body.linkedInUrl = linkedInUrl;
    if (websiteUrl) body.websiteUrl = websiteUrl;
    if (sourceId) body.sourceId = sourceId;
    if (location) body.location = location;
    const data = await ashbyRequest("candidate.create", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "candidate_create_note",
  "Add a note to a candidate",
  {
    candidateId: z.string().describe("The ID of the candidate"),
    note: z.string().describe("The note text to add"),
  },
  async ({ candidateId, note }) => {
    const data = await ashbyRequest("candidate.createNote", { candidateId, note });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "candidate_add_tag",
  "Add a tag to a candidate",
  {
    candidateId: z.string().describe("The ID of the candidate"),
    tagId: z.string().describe("The ID of the tag to add"),
  },
  async ({ candidateId, tagId }) => {
    const data = await ashbyRequest("candidate.addTag", { candidateId, tagId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Applications ──────────────────────────────────────────────────────────────

server.tool(
  "application_list",
  "List all applications with optional filters and pagination",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    syncToken: z.string().optional().describe("Sync token for incremental sync"),
    jobId: z.string().optional().describe("Filter by job ID"),
    status: z
      .enum(["Active", "Archived", "Lead"])
      .optional()
      .describe("Filter by application status"),
  },
  async ({ cursor, limit, syncToken, jobId, status }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (syncToken) body.syncToken = syncToken;
    if (jobId) body.jobId = jobId;
    if (status) body.status = status;
    const data = await ashbyRequest("application.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              applications: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
              syncToken: data.syncToken,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "application_info",
  "Get detailed information about a specific application",
  {
    applicationId: z.string().describe("The ID of the application"),
  },
  async ({ applicationId }) => {
    const data = await ashbyRequest("application.info", { id: applicationId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "application_change_stage",
  "Move an application to a different interview stage",
  {
    applicationId: z.string().describe("The ID of the application"),
    interviewStageId: z.string().describe("The ID of the target interview stage"),
  },
  async ({ applicationId, interviewStageId }) => {
    const data = await ashbyRequest("application.changeStage", { applicationId, interviewStageId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "application_update",
  "Update an application's fields",
  {
    applicationId: z.string().describe("The ID of the application"),
    customFields: z
      .array(z.object({ id: z.string(), value: z.unknown() }))
      .optional()
      .describe("Custom field values to set"),
    source: z.string().optional().describe("Source ID to set on the application"),
  },
  async ({ applicationId, customFields, source }) => {
    const body = { applicationId };
    if (customFields) body.customFields = customFields;
    if (source) body.source = source;
    const data = await ashbyRequest("application.update", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Jobs ──────────────────────────────────────────────────────────────────────

server.tool(
  "job_list",
  "List all jobs with optional pagination",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    syncToken: z.string().optional().describe("Sync token for incremental sync"),
  },
  async ({ cursor, limit, syncToken }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (syncToken) body.syncToken = syncToken;
    const data = await ashbyRequest("job.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              jobs: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
              syncToken: data.syncToken,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "job_info",
  "Get detailed information about a specific job",
  {
    jobId: z.string().describe("The ID of the job"),
  },
  async ({ jobId }) => {
    const data = await ashbyRequest("job.info", { id: jobId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "job_search",
  "Search for jobs by title or other criteria",
  {
    title: z.string().optional().describe("Job title to search for"),
  },
  async ({ title }) => {
    const body = {};
    if (title) body.title = title;
    const data = await ashbyRequest("job.search", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Job Postings ──────────────────────────────────────────────────────────────

server.tool(
  "job_posting_list",
  "List all public job postings",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    liferayPostingStatus: z
      .enum(["Draft", "Published", "Closed"])
      .optional()
      .describe("Filter by posting status"),
  },
  async ({ cursor, limit, liferayPostingStatus }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (liferayPostingStatus) body.liferayPostingStatus = liferayPostingStatus;
    const data = await ashbyRequest("jobPosting.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              jobPostings: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "job_posting_info",
  "Get detailed information about a specific job posting",
  {
    jobPostingId: z.string().describe("The ID of the job posting"),
  },
  async ({ jobPostingId }) => {
    const data = await ashbyRequest("jobPosting.info", { jobPostingId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Interview Schedules ───────────────────────────────────────────────────────

server.tool(
  "interview_schedule_list",
  "List all interview schedules with optional pagination",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    syncToken: z.string().optional().describe("Sync token for incremental sync"),
    applicationId: z.string().optional().describe("Filter by application ID"),
  },
  async ({ cursor, limit, syncToken, applicationId }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (syncToken) body.syncToken = syncToken;
    if (applicationId) body.applicationId = applicationId;
    const data = await ashbyRequest("interviewSchedule.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              schedules: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
              syncToken: data.syncToken,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "interview_schedule_cancel",
  "Cancel an interview schedule",
  {
    interviewScheduleId: z.string().describe("The ID of the interview schedule to cancel"),
  },
  async ({ interviewScheduleId }) => {
    const data = await ashbyRequest("interviewSchedule.cancel", { interviewScheduleId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Offers ────────────────────────────────────────────────────────────────────

server.tool(
  "offer_list",
  "List all offers with optional pagination",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    syncToken: z.string().optional().describe("Sync token for incremental sync"),
  },
  async ({ cursor, limit, syncToken }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (syncToken) body.syncToken = syncToken;
    const data = await ashbyRequest("offer.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              offers: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
              syncToken: data.syncToken,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "offer_info",
  "Get detailed information about a specific offer",
  {
    offerId: z.string().describe("The ID of the offer"),
  },
  async ({ offerId }) => {
    const data = await ashbyRequest("offer.info", { id: offerId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Users ─────────────────────────────────────────────────────────────────────

server.tool(
  "user_list",
  "List all users in the organization",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
  },
  async ({ cursor, limit }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    const data = await ashbyRequest("user.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              users: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "user_search",
  "Search for users by email or name",
  {
    email: z.string().optional().describe("Email address to search for"),
    name: z.string().optional().describe("Name to search for"),
  },
  async ({ email, name }) => {
    const body = {};
    if (email) body.email = email;
    if (name) body.name = name;
    const data = await ashbyRequest("user.search", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Organization ──────────────────────────────────────────────────────────────

server.tool(
  "department_list",
  "List all departments in the organization",
  {
    cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (max 100)"),
    includeArchived: z.boolean().optional().describe("Include archived departments"),
  },
  async ({ cursor, limit, includeArchived }) => {
    const body = {};
    if (cursor) body.cursor = cursor;
    if (limit) body.limit = limit;
    if (includeArchived !== undefined) body.includeArchived = includeArchived;
    const data = await ashbyRequest("department.list", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              departments: data.results,
              moreDataAvailable: data.moreDataAvailable,
              nextCursor: data.nextCursor,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "source_list",
  "List all candidate sources",
  {},
  async () => {
    const data = await ashbyRequest("source.list", {});
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "candidate_tag_list",
  "List all available candidate tags",
  {},
  async () => {
    const data = await ashbyRequest("candidateTag.list", {});
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "custom_field_list",
  "List all custom fields defined in the organization",
  {
    objectType: z
      .enum(["Application", "Candidate", "Job", "Offer"])
      .optional()
      .describe("Filter by the object type the custom field applies to"),
  },
  async ({ objectType }) => {
    const body = {};
    if (objectType) body.objectType = objectType;
    const data = await ashbyRequest("customField.list", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "interview_stage_list",
  "List all interview stages, optionally filtered by job",
  {
    jobId: z.string().optional().describe("Filter stages by job ID"),
  },
  async ({ jobId }) => {
    const body = {};
    if (jobId) body.jobId = jobId;
    const data = await ashbyRequest("interviewStage.list", body);
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

server.tool(
  "application_feedback_list",
  "List feedback submitted for an application",
  {
    applicationId: z.string().describe("The ID of the application"),
  },
  async ({ applicationId }) => {
    const data = await ashbyRequest("applicationFeedback.list", { applicationId });
    return { content: [{ type: "text", text: JSON.stringify(data.results, null, 2) }] };
  }
);

// ─── Start server ──────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
