import { Ollama, type Message, type Tool } from "ollama";

console.log(process.env.OLLAMA_API_KEY);
export class OllamaModel {
  model: string;
  host: string;

  constructor(model: string, host: string) {
    this.model = model;
    this.host = host;
  }


  async chat(messages: Message[], tools: Tool[]) {
    const ollama = new Ollama({
      host: this.host,
      headers: { Authorization: 'Bearer ' + process.env.OLLAMA_API_KEY },
    });
    const res = await ollama.chat({
      model: this.model,
      messages,
      tools,
      stream: true,
    });

    return res;
  }
}
