import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class McpToolProvider {
  private client?: Client;
  private tools: any[] = [];
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect() {
    this.client = new Client({ name: "local-mcp-harness", version: "0.1.0" }, { capabilities: {} });

    const transport = new StreamableHTTPClientTransport(new URL(this.url));
    await this.client.connect(transport);

    this.tools = (await this.client.listTools()).tools ?? [];

    return this.tools;
  }

  getTools() {
    return this.tools;
  }

  async callTool(name: string, args: Record<string, unknown>) {
    if (!this.client) throw new Error("MCP client is not connected");

    return this.client.callTool({ name, arguments: args });
  }
}
