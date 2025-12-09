import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <h1>Få en objektiv vurdering av din startup-idé på sekunder</h1>
        <p className="landing-subtitle">
          For gründere og tidligfase startups. AI analyserer pitchen og vurderer
          marked, risiko, innovasjon og gjennomførbarhet som gir deg innsikt som
          hjelper deg med å ta smartere beslutninger.
        </p>
        <Link className="landing-cta" to="/ideas">
          Analyser ideen din
        </Link>
      </section>

      <section className="landing-steps">
        <h2>Slik fungerer det</h2>
        <div className="landing-steps-grid">
          <div className="step">
            <div className="step-icon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M24 6c-6.6 0-12 5.1-12 11.5 0 4.1 2.3 7.6 5.8 9.7v4.8c0 .6.5 1.1 1.1 1.1H21v2.5c0 .8.7 1.4 1.5 1.4h3c.8 0 1.5-.6 1.5-1.4V33h1.1c.6 0 1.1-.5 1.1-1.1V27c3.5-2.1 5.8-5.7 5.8-9.7C36 11.1 30.6 6 24 6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 34h8m-4-22v4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="step-title">Idé</div>
          </div>

          <div className="step-arrow">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="step">
            <div className="step-icon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M12 32V18m8 14V14m8 18V22m8 10V10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="step-title">Analyser</div>
          </div>

          <div className="step-arrow">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="step">
            <div className="step-icon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect
                  x="10"
                  y="8"
                  width="28"
                  height="32"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  d="M16 18h8m-8 8h4m6-3 4 4 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="step-title">Innsikt</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
