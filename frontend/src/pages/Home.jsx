import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import PageLoader from "../components/PageLoader";
import { useAuth } from "../context/AuthContext";
import { mediaUrl, money, raffleProgress } from "../utils/format";

export default function Home() {
  const { user } = useAuth();

  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadRaffles() {
      try {
        const response = await api.get("/raffles");
        setRaffles(response.data);
      } catch {
        setError("Não foi possível carregar as rifas no momento.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffles();
  }, []);

  const filteredRaffles = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return raffles;

    return raffles.filter((raffle) => {
      return (
        raffle.title?.toLowerCase().includes(term) ||
        raffle.subtitle?.toLowerCase().includes(term)
      );
    });
  }, [raffles, search]);

  const summary = useMemo(() => {
    const total = raffles.length;
    const available = raffles.reduce(
      (acc, raffle) => acc + Number(raffle.available_numbers_count || 0),
      0
    );
    const sold = raffles.reduce(
      (acc, raffle) => acc + Number(raffle.sold_numbers_count || 0),
      0
    );

    return {
      total,
      available,
      sold,
    };
  }, [raffles]);

  return (
    <div className="internal-rifas-page">
      <FloatingBackground />

      <div className="container internal-rifas-container">
        <section className="internal-rifas-hero">
          <div>
            <span className="hero-badge">Área interna das rifas</span>
            <h1>Bem-vindo{user?.name ? `, ${user.name}` : ""}.</h1>
            <p>
              Escolha uma rifa ativa para participar, acompanhe seus pedidos e
              navegue pela sua área com mais organização.
            </p>

            <div className="internal-rifas-actions">
              <Link to="/cliente/pedidos">
                <button>Meus pedidos</button>
              </Link>

              <Link to="/cliente">
                <button className="secondary-btn">Minha área</button>
              </Link>
            </div>
          </div>

          <div className="internal-rifas-summary">
            <div className="internal-summary-card">
              <span>Rifas ativas</span>
              <strong>{summary.total}</strong>
            </div>

            <div className="internal-summary-card">
              <span>Números disponíveis</span>
              <strong>{summary.available}</strong>
            </div>

            <div className="internal-summary-card">
              <span>Números vendidos</span>
              <strong>{summary.sold}</strong>
            </div>
          </div>
        </section>

        <section className="glass-card internal-rifas-toolbar">
          <div>
            <h2>Explorar rifas</h2>
            <p className="muted-text">
              Pesquise rapidamente por título ou subtítulo.
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar rifa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {loading && (
          <PageLoader
            title="Carregando rifas"
            description="Estamos buscando as campanhas disponíveis."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && !filteredRaffles.length && (
          <EmptyState
            title="Nenhuma rifa encontrada"
            description="Tente outro termo de busca ou aguarde novas rifas ficarem ativas."
          />
        )}

        {!loading && !error && filteredRaffles.length > 0 && (
          <div className="raffle-grid premium-grid">
            {filteredRaffles.map((raffle) => {
              const progress = raffleProgress(raffle);

              return (
                <div key={raffle.id} className="premium-raffle-card internal-raffle-card">
                  {raffle.banner_path ? (
                    <div className="premium-raffle-banner">
                      <img src={mediaUrl(raffle.banner_path)} alt={raffle.title} />
                    </div>
                  ) : (
                    <div className="premium-raffle-banner premium-raffle-banner-empty">
                      <span>Banner da rifa</span>
                    </div>
                  )}

                  <div
                    className="premium-raffle-body"
                    style={{
                      background: raffle.design?.background_color || "#0f172a",
                      color: raffle.design?.text_color || "#ffffff",
                    }}
                  >
                    <div className="premium-raffle-top">
                      {raffle.logo_path ? (
                        <img
                          src={mediaUrl(raffle.logo_path)}
                          alt="Logo da rifa"
                          className="premium-raffle-logo"
                        />
                      ) : (
                        <div className="premium-raffle-logo premium-raffle-logo-empty">
                          Logo
                        </div>
                      )}

                      <div>
                        <h3>{raffle.title}</h3>
                        <p>{raffle.subtitle || "Rifa ativa"}</p>
                      </div>
                    </div>

                    <div className="internal-raffle-meta-grid">
                      <div className="internal-raffle-meta-box">
                        <span>Valor</span>
                        <strong>{money(raffle.price_per_ticket)}</strong>
                      </div>

                      <div className="internal-raffle-meta-box">
                        <span>Total</span>
                        <strong>{raffle.total_numbers}</strong>
                      </div>

                      <div className="internal-raffle-meta-box">
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

                    <div className="internal-raffle-footer">
                      <div className="internal-raffle-status-pill">
                        <span>Online</span>
                      </div>

                      <Link to={`/rifa/${raffle.slug}`}>
                        <button
                          style={{
                            background: raffle.design?.button_color || "#7c3aed",
                            color: raffle.design?.button_text_color || "#ffffff",
                          }}
                        >
                          Entrar na rifa
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}