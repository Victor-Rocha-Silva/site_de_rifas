import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ProgressBar from "../components/ProgressBar";
import { mediaUrl, money, raffleProgress } from "../utils/format";

export default function Home() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRaffles() {
      try {
        const response = await api.get("/raffles");
        setRaffles(response.data);
      } catch {
        setError("Erro ao carregar as rifas.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffles();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Rifas Online</h1>
        <p>Participe das rifas ativas e acompanhe seus números.</p>
      </div>

      {loading && <p>Carregando rifas...</p>}
      {error && <p className="error">{error}</p>}

      <div className="raffle-grid">
        {raffles.map((raffle) => {
          const progress = raffleProgress(raffle);

          return (
            <div key={raffle.id} className="raffle-card-modern">
              {raffle.banner_path && (
                <div className="raffle-banner">
                  <img src={mediaUrl(raffle.banner_path)} alt={raffle.title} />
                </div>
              )}

              <div
                className="raffle-card-body"
                style={{
                  background: raffle.design?.background_color || "#0f172a",
                  color: raffle.design?.text_color || "#fff",
                }}
              >
                <div className="raffle-card-top">
                  {raffle.logo_path && (
                    <img
                      src={mediaUrl(raffle.logo_path)}
                      alt="Logo"
                      className="raffle-logo"
                    />
                  )}

                  <div>
                    <h2>{raffle.title}</h2>
                    <p>{raffle.subtitle}</p>
                  </div>
                </div>

                <div className="raffle-stats">
                  <div className="mini-stat">
                    <span>Valor</span>
                    <strong>{money(raffle.price_per_ticket)}</strong>
                  </div>

                  <div className="mini-stat">
                    <span>Números</span>
                    <strong>{raffle.total_numbers}</strong>
                  </div>

                  <div className="mini-stat">
                    <span>Disponíveis</span>
                    <strong>{raffle.available_numbers_count}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="progress-label">
                    <span>Progresso</span>
                    <strong>{progress}%</strong>
                  </div>

                  <ProgressBar value={progress} />
                </div>

                <div style={{ marginTop: 18 }}>
                  <Link to={`/rifa/${raffle.slug}`}>
                    <button
                      style={{
                        background: raffle.design?.button_color || "#7c3aed",
                        color: raffle.design?.button_text_color || "#fff",
                      }}
                    >
                      Ver rifa
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}