import { FormEvent, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type IdeaResponse = {
  id: number;
  title: string;
  content: string;
  analysis?: {
    score: number;
    strengths?: string[];
    weaknesses?: string[];
    summary?: string;
  };
};

type ErrorResponse = {
  message?: string;
};

function IdeaSubmissionPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [analysis, setAnalysis] = useState<IdeaResponse["analysis"] | null>(
    null
  );

  const token = localStorage.getItem("token");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("Du må være innlogget for å sende inn en idé.");
      return;
    }

    setStatus("Sender inn...");
    setAnalysis(null);

    try {
      const res = await fetch(`${API_URL}/api/ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const err = (await res.json()) as ErrorResponse;
        setStatus(err.message ?? "Noe gikk galt.");
        return;
      }

      const data = (await res.json()) as IdeaResponse;
      setAnalysis(data.analysis ?? null);
      setStatus("Idé sendt.");
      setTitle("");
      setContent("");
    } catch {
      setStatus("Klarte ikke å kontakte serveren.");
    }
  }

  return (
    <section className="page">
      <h1>Ideinnsending</h1>
      <p>Send inn en idé. Krever innlogging (token fra auth-siden).</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Tittel
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Beskrivelse
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
          />
        </label>
        <button type="submit">Send inn</button>
      </form>
      {status && <p className="status">{status}</p>}
      {analysis && (
        <div className="card">
          <h3>Simulert analyse</h3>
          {analysis.score !== undefined && <p>Score: {analysis.score}</p>}
          {analysis.summary && <p>{analysis.summary}</p>}
          {analysis.strengths && (
            <div>
              <strong>Styrker:</strong>
              <ul>
                {analysis.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.weaknesses && (
            <div>
              <strong>Svakheter:</strong>
              <ul>
                {analysis.weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default IdeaSubmissionPage;
