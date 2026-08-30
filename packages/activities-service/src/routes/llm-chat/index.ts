import { Router } from "express";
import { Agent } from "./agent.ts";

const agent = new Agent();

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/tools', (_req, res) => res.json(agent.getTools()));

router.post('/chat', async (req, res) => {
  const text = String(req.body?.message ?? '').trim();

  if (!text) return res.status(400).json({ error: 'message is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    for await (const event of agent.run(text)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.write(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`);
  } finally {
    res.end();
  }
});

export {
  router as llmChatRouter,
};
