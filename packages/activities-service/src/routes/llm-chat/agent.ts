import type { Message, Tool } from "ollama";
import { OllamaModel } from "./ollama.ts";
import { McpToolProvider } from "./mcp.ts";

export type AgentEvent =
  | { type: "message"; content: string; }
  | { type: "tool_start"; name: string; arguments: unknown; }
  | { type: "tool_result"; name: string; result: unknown; }
  | { type: "error"; error: string; }
  | { type: "done"; };

function toOllamaTool(tool: any): Tool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema ?? { type: "object", properties: {} }
    }
  };
}

export class Agent {
  private mcp: McpToolProvider;
  private model: OllamaModel;
  private messages: Message[] = [];

  constructor(
    mcpUrl = process.env.MCP_URL ?? "http://localhost:3001/mcp",
    // model = process.env.OLLAMA_MODEL ?? 'lfm2-64k-context',
    // ollamaUrl = process.env.OLLAMA_URL ?? "http://host.docker.internal:11434"
    model = process.env.OLLAMA_MODEL ?? "gemma4:cloud",
    ollamaUrl = process.env.OLLAMA_URL ?? "https://ollama.com"
  ) {
    this.mcp = new McpToolProvider(mcpUrl);
    this.model = new OllamaModel(model, ollamaUrl);
  }

  async init() {
    await this.mcp.connect();
  }

  getTools() {
    return this.mcp.getTools();
  }

  async *run(userMessage: string, userTools: Tool[] = []): AsyncGenerator<AgentEvent> {
    await this.init();
    this.messages.push({ role: "user", content: userMessage });
    const mcpTools = this.mcp.getTools().map(toOllamaTool);
    const tools = [...userTools, ...mcpTools];


    for (let turn = 0; turn < 12; turn++) {
      const response = await this.model.chat(this.messages, tools);

      for await (const msg of response) {
        // yield { type: 'message', content: msg.message.content };

        const message = msg.message;
        if (message.content) {
          yield { type: "message", content: message.content };
        }

        const calls = message.tool_calls ?? [];
        // if (!calls.length) {
        //   yield { type: "done" }; return;
        // }

        for (const call of calls) {
          const name = call.function.name;
          const args = call.function.arguments ?? {};

          yield { type: "tool_start", name, arguments: args };

          try {
            const isMcpTool = !!mcpTools.find((t) => t.function?.name === name);
            if (isMcpTool) {
              const result = await this.mcp.callTool(name, args);
              this.messages.push({ role: "tool", tool_name: name, content: JSON.stringify(result) });
              yield { type: "tool_result", name, result };
            } else {
              yield { type: 'tool_result', name, result: { content: [{ ...args }] } };
            }

          } catch (error) {
            const text = error instanceof Error ? error.message : String(error);
            this.messages.push({ role: "tool", tool_name: name, content: JSON.stringify({ error: text }) });

            yield { type: "tool_result", name, result: { error: text } };
          }
        }
      }

      yield { type: "done" }; return;
    }
    yield { type: "error", error: "The agent reached its maximum tool-call turns." };
  }
}
