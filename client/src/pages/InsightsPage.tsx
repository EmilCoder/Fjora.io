import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type IdeaListItem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  analysis?: {
    score?: number;
    strengths?: string[];
    weaknesses?: string[];
    summary?: string;
  };
};

type ErrorResponse = {
  message?: string;
};

function InsightsPage() {
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [status, setStatus] = useState<string>("");

  async function fetchIdeas() {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Logg inn for å se egne ideer og analyser.");
      return;
    }
    setStatus("Henter ideer...");
    try {
      const res = await fetch(`${API_URL}/api/ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = (await res.json()) as ErrorResponse;
        setStatus(err.message ?? "Kunne ikke hente ideer.");
        return;
      }
      const data = (await res.json()) as IdeaListItem[];
      setIdeas(data);
      setStatus(data.length === 0 ? "Ingen ideer ennå." : "");
    } catch {
      setStatus("Klarte ikke å kontakte serveren.");
    }
  }

  useEffect(() => {
    fetchIdeas();
  }, []);

  return (
    <section className="page">
      <h1>Innsiktsside</h1>
      <p>Viser dine innsendre ideer med simulert AI-analyse.</p>
      {status && <p className="status">{status}</p>}
      <div className="cards">
        {ideas.map((idea) => (
          <div className="card" key={idea.id}>
            <div className="card-header">
              <div>
                <h3>{idea.title}</h3>
                <small>
                  {new Date(idea.createdAt).toLocaleString("no-NO")}
                </small>
              </div>
              {idea.analysis?.score !== undefined && (
                <div className="pill">Score: {idea.analysis.score}</div>
              )}
            </div>
            <p>{idea.content}</p>
            {idea.analysis?.summary && <p>{idea.analysis.summary}</p>}
            {idea.analysis?.strengths && idea.analysis.strengths.length > 0 && (
              <div>
                <strong>Styrker:</strong>
                <ul>
                  {idea.analysis.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {idea.analysis?.weaknesses &&
              idea.analysis.weaknesses.length > 0 && (
                <div>
                  <strong>Svakheter:</strong>
                  <ul>
                    {idea.analysis.weaknesses.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default InsightsPage;
