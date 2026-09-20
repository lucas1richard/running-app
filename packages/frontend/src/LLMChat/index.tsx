import { useEffect, useState } from 'react';
import styles from './LLMChat.module.css';
import requestor from '@/utils/requestor';
import Markdown from 'react-markdown';
import Tile from '@/Activities/Tile';

type Event =
  | { type: 'message'; content: string; }
  | { type: 'tool_start'; name: string; arguments: unknown; }
  | { type: 'tool_result'; name: string; result: { content: { type: string; data: unknown; }[]; }; }
  | { type: 'error'; error: string; }
  | { type: 'done'; };

type Item = {
  role: 'user' | 'assistant' | 'tool' | 'tool_result';
  content: string;
};

function LLMChat() {
  const [items, setItems] = useState<Item[]>([]),
    [input, setInput] = useState(''),
    [busy, setBusy] = useState(false),
    [tools, setTools] = useState<any[]>([]),
    [returnMsg, setReturnMsg] = useState<string>('');

  useEffect(() => {
    requestor.get('/llm-chat/tools')
      .then(r => r.json())
      .then(setTools)
      .catch(() => { });
  }, []);

  async function send() {
    const message = input.trim();
    if (!message || busy) return;
    setInput('');
    setBusy(true);
    setItems((p) => [...p, { role: 'user', content: message }]);
    try {
      const r = await requestor.post(
        '/llm-chat/chat',
        {
          message,
          tools: [{
            "name": "render_ui",
            "description": "Render a UI component for the user.",
            "inputSchema": {
              "type": "object",
              "properties": {
                "component": {
                  "type": "string",
                  "enum": ["chart", "table", "card"]
                },
                "props": {
                  "type": "object"
                }
              },
              "required": ["component", "props"]
            }
          }],
        }
      );
      if (!r.ok || !r.body) throw new Error(await r.text());
      const reader = r.body.getReader(), decoder = new TextDecoder();
      let buffer = '';
      let response = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setItems((p) => [
            ...p,
            { role: 'assistant', content: response }
          ]);
          setReturnMsg('');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';

        for (const chunk of chunks) {
          const line = chunk
            .split('\n')
            .find(x => x.startsWith('data: '));

          if (!line) continue;

          const e = JSON.parse(line.slice(6)) as Event;

          if (e.type === 'message') {
            response += e.content;
            setReturnMsg(response);
          }
          else if (e.type === 'tool_start') {
            setItems((p) => [
              ...p,
              { role: 'tool', content: `Calling ${e.name}(${JSON.stringify(e.arguments)})` }
            ]);
          }
          else if (e.type === 'tool_result') {
            const dataType = e.result.content[0].type;

            setItems((p) => [
              ...p,
              {
                role: 'tool_result',
                content: JSON.stringify(e.result.content),
              }
            ]);
          }
          else if (e.type === 'error') {
            setItems((p) => [
              ...p,
              { role: 'assistant', content: `Error: ${e.error}` }
            ]);
          }
        }
      }
    } catch (e) {
      setItems((p) => [...p, { role: 'assistant', content: `Request failed: ${e instanceof Error ? e.message : String(e)}` }]);
    }
    finally {
      setBusy(false);

    }
  }

  return (
    <main className={`${styles.app}`}>
      <header>
        <div>
          <h1>Local MCP Harness</h1>
          <p>Ollama + MCP + React</p>
        </div>
        <div className={`${styles.tools}`}>
          {tools.length ? `${tools.length} MCP tools` : 'Connecting to MCP…'}
        </div>
      </header>

      <section className={`${styles.chat}`}>
        {!items.length && (
          <div className={`${styles.empty}`}>
            <h2>What should we investigate?</h2>
          </div>
        )}
        {items.map((x, i) => {
          if (x.role === 'tool_result') {
            return (
              <article className={`${styles.item} ${styles[x.role]}`} key={i}>
                <div className={`${styles.role}`}>{x.role}</div>
                {/* {JSON.parse(JSON.parse(x.content)?.[0]?.text)?.data.map((a) => <Tile activity={a} key={a.id} />)} */}
                {x.content}
              </article>
            );
          }
          return (
            <article className={`${styles.item} ${styles[x.role]}`} key={i}>
              <div className={`${styles.role}`}>{x.role}</div>
              <Markdown>{x.content}</Markdown>
            </article>
          );
        })}
        {returnMsg && (
          <article className={`${styles.item} ${styles.assistant}`}>
            <div className={`${styles.role}`}>{'assistant'}</div>
            <Markdown>{returnMsg}</Markdown>
          </article>
        )}
      </section>

      <form onSubmit={e => { e.preventDefault(); void send(); }} className="flex flex-column">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Ask something…'
          disabled={busy}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button className="w-full" disabled={busy || !input.trim()}>{busy ? 'Working…' : 'Send'}</button>
      </form>
    </main>
  );
}

export default LLMChat;
