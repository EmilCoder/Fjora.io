import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const [statusType, setStatusType] = useState<"idle" | "success" | "error" | "info">("idle");
  const [analysis, setAnalysis] = useState<IdeaResponse["analysis"] | null>(
    null
  );
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setStatus("Sender inn...");
    setStatusType("info");
    setAnalysis(null);

    async function sendRequest(withToken: boolean) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const token = withToken ? localStorage.getItem("token") : null;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/ideas`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, content }),
      });

      return res;
    }

    try {
      // First try with token (if present)
      let res = await sendRequest(true);

      // If token is invalid, clear it and retry once without token
      if (res.status === 401) {
        localStorage.removeItem("token");
        res = await sendRequest(false);
      }

      if (!res.ok) {
        const err = (await res.json()) as ErrorResponse;
        setStatus(err.message ?? "Noe gikk galt.");
        setStatusType("error");
        return;
      }

      const data = (await res.json()) as IdeaResponse;
      setAnalysis(data.analysis ?? null);
      setStatus("Idé analysert.");
      setStatusType("success");
      setTitle("");
      setContent("");

      const latestAnalysis = {
        title: data.title,
        content: data.content,
        analysis: data.analysis ?? null,
        createdAt: new Date().toISOString(),
        note: (data as any).note as string | undefined,
      };
      navigate("/insights", { state: { latestAnalysis } });
    } catch {
      setStatus("Klarte ikke å kontakte serveren.");
      setStatusType("error");
    }
  }

  return (
    <div className="idea-page">
      <section className="idea-hero">
        <div className="idea-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="presentation">
            <path
              d="M32 8c-9 0-16.5 7.2-16.5 16.2 0 5.8 3.2 10.8 8 13.8V46c0 .9.8 1.7 1.8 1.7h3.2v3.7c0 1.2 1 2.1 2.2 2.1h5c1.2 0 2.2-.9 2.2-2.1V47.7h3.2c1 0 1.8-.8 1.8-1.7v-7.9c4.8-3 8-8 8-13.8C48.5 15.2 41 8 32 8Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 46h8m-4-30v6"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1>Din idé</h1>

        <form className="idea-form" onSubmit={handleSubmit}>
          <div className="idea-field">
            <label className="idea-label" htmlFor="idea-title">
              Tittel på din idé
            </label>
            <input
              id="idea-title"
              className="idea-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='F.eks. "App for smartere budsjett"'
            />
          </div>

          <div className="idea-field">
            <div className="idea-label-row">
              <label className="idea-label" htmlFor="idea-description">
                Beskriv din idé
              </label>
              <span className="idea-hint">
                Forklar kort: Problem → Løsning → Målgruppe → Konkurrenter
              </span>
            </div>
            <textarea
              id="idea-description"
              className="idea-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              placeholder='F.eks. “Studenter sliter med å holde oversikt over utgifter. Jeg vil lage en app som automatisk kategoriserer kjøp og gir enkle sparetips. Målgruppen er unge voksne med lite økonomisk erfaring.”'
            />
          </div>

          <button className="idea-submit" type="submit" disabled={status === "Sender inn..."}>
            {status === "Sender inn..." ? "Analyserer..." : "Analyser"}
          </button>
        </form>

        {status && (
          <div className={`status-banner status-${statusType}`}>{status}</div>
        )}
        {analysis && (
          <div className="idea-analysis">
            <div className="idea-analysis-header">
              <h3>Simulert analyse</h3>
              <Link to="/insights">Gå til innsikt</Link>
            </div>
            {analysis.score !== undefined && (
              <p className="idea-score">Score: {analysis.score}</p>
            )}
            {analysis.summary && <p className="idea-summary">{analysis.summary}</p>}
            <div className="idea-columns">
              {analysis.strengths && (
                <div>
                  <strong>Styrker</strong>
                  <ul>
                    {analysis.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.weaknesses && (
                <div>
                  <strong>Svakheter</strong>
                  <ul>
                    {analysis.weaknesses.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default IdeaSubmissionPage;
