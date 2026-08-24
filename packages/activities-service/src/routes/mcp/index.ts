import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { McpSessionManager } from './session-manager.ts';

const router = Router();

// Initialize the Session Manager with a 30-minute TTL
const sessionManager = new McpSessionManager(30);

// Setup a background interval to clean up expired sessions every 15 minutes
setInterval(() => {
  sessionManager.cleanupSessions();
}, 15 * 60 * 1000);

router.post('/', async (req, res) => {
  try {
    // 1. Determine Session ID (from header or generate new one)
    const sessionId = (req.headers['x-session-id'] as string)
      || req.headers['mcp-session-id']
      || randomUUID();

    console.log(req.headers);
    console.log(`MCP POST [Session: ${sessionId}]:`, JSON.stringify(req.body, null, 2));

    // 2. Get the session from the manager (creates one if it doesn't exist)
    const session = await sessionManager.getSession(sessionId);

    // 3. Route the request to the session-specific transport
    await session.transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
});

router.use((err: unknown, req: Request, res: Response, next: Function) => {
  console.error('Express MCP error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
});

export {
  router as mcpRouter,
};
