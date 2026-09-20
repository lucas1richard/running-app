import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport';
import { findAllActivities } from '../../persistence/activities/index.ts';

export interface McpSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
  lastSeen: number;
}

export class McpSessionManager {
  private sessions = new Map<string, McpSession>();
  private readonly ttlMs: number;

  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  /**
   * Gets an existing session or creates a new one for the given sessionId.
   */
  async getSession(sessionId: string): Promise<McpSession> {
    let session = this.sessions.get(sessionId);

    if (!session) {
      console.log(`[McpSessionManager] Creating new session: ${sessionId}`);
      session = this.createSession(sessionId);
      this.sessions.set(sessionId, session);
    }

    session.lastSeen = Date.now();
    return session;
  }

  private createSession(sessionId: string): McpSession {
    const server = new McpServer({
      name: "activities-service-mcp",
      version: "1.0.0",
    });

    // Initial tool registration
    this.registerTools(server);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    });

    server.connect(transport as Transport);

    return {
      server,
      transport,
      lastSeen: Date.now(),
    };
  }

  private registerTools(server: McpServer) {
    server.registerTool(
      "list_recent_activities",
      {
        description: 'list recent activities from the running-app',
        inputSchema: {},
      },
      async () => {
        const activities = await findAllActivities();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              type: 'activities_list',
              data: activities.slice(0, 3)
            })
          }],
        };
      }
    );
  }

  /**
   * Removes sessions that haven't been seen for longer than the TTL.
   */
  cleanupSessions(): void {
    const now = Date.now();
    let count = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastSeen > this.ttlMs) {
        console.log(`[McpSessionManager] Cleaning up expired session: ${id}`);
        this.sessions.delete(id);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[McpSessionManager] Cleaned up ${count} expired sessions.`);
    }
  }

  get sessionCount(): number {
    return this.sessions.size;
  }
}
