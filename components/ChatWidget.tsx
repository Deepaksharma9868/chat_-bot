"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    let reply = "Sorry, something went wrong. Please email support@yourdomain.com.";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (res.ok && data.reply) reply = data.reply;
    } catch {}
    setMsgs([...next, { role: "assistant", content: reply }]);
    setBusy(false);
  }

  const box: React.CSSProperties = { position: "fixed", right: 16, bottom: 16, zIndex: 1000, fontFamily: "sans-serif" };
  if (!open)
    return <button style={box} aria-label="Open chat" onClick={() => setOpen(true)}>💬 Chat</button>;

  return (
    <div style={{ ...box, width: 320, background: "#fff", color: "#000", border: "1px solid #ccc", borderRadius: 8, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 8, borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
        <strong>Support</strong>
        <button aria-label="Close chat" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div style={{ height: 300, overflowY: "auto", padding: 8 }} aria-live="polite">
        {msgs.map((m, i) => (
          <p key={i} style={{ textAlign: m.role === "user" ? "right" : "left", margin: "6px 0" }}>{m.content}</p>
        ))}
        {busy && <p>…</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 4, padding: 8 }}>
        <input style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message" />
        <button disabled={busy}>Send</button>
      </form>
    </div>
  );
}
