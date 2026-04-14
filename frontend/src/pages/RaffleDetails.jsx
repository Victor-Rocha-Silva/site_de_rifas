import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";
import { mediaUrl, money, raffleProgress } from "../utils/format";

export default function RaffleDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [raffle, setRaffle] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadRaffle() {
      try {
        const response = await api.get(`/raffles/${slug}`);
        setRaffle(response.data);
      } catch {
        setError("Erro ao carregar a rifa.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffle();
  }, [slug]);

  async function handleCreateOrder() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "customer") {
      setError("Somente clientes podem criar pedidos.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/orders", {
        raffle_id: raffle.id,
        quantity: Number(quantity),
      });

      setMessage(response.data.message || "Pedido criado com sucesso.");

      setTimeout(() => {
        navigate("/cliente/pedidos");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container">Carregando...</div>;
  }

  if (!raffle) {
    return <div className="container">Rifa não encontrada.</div>;
  }

  const progress = raffleProgress(raffle);

  return (
    <div className="container">
      <div className="hero-raffle">
        {raffle.banner_path && (
          <div className="hero-raffle-banner">
            <img src={mediaUrl(raffle.banner_path)} alt={raffle.title} />
          </div>
        )}

        <div
          className="hero-raffle-content"
          style={{
            background: raffle.design?.background_color || "#0f172a",
            color: raffle.design?.text_color || "#fff",
          }}
        >
          <div className="hero-raffle-head">
            {raffle.logo_path && (
              <img
                src={mediaUrl(raffle.logo_path)}
                alt="Logo da rifa"
                className="hero-raffle-logo"
              />
            )}

            <div>
              <h1>{raffle.title}</h1>
              <p>{raffle.subtitle}</p>
            </div>
          </div>

          <p className="hero-description">{raffle.description}</p>

          {raffle.instagram_url && (
            <p>
              Instagram:{" "}
              <a href={raffle.instagram_url} target="_blank" rel="noreferrer">
                {raffle.instagram_url}
              </a>
            </p>
          )}

          <div className="raffle-stats-large">
            <div className="mini-stat">
              <span>Valor por cota</span>
              <strong>{money(raffle.price_per_ticket)}</strong>
            </div>

            <div className="mini-stat">
              <span>Total</span>
              <strong>{raffle.total_numbers}</strong>
            </div>

            <div className="mini-stat">
              <span>Disponíveis</span>
              <strong>{raffle.available_numbers_count}</strong>
            </div>

            <div className="mini-stat">
              <span>Vendidos</span>
              <strong>{raffle.sold_numbers_count}</strong>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="progress-label">
              <span>Progresso da rifa</span>
              <strong>{progress}%</strong>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="glass-card">
          <h2>Prêmios</h2>

          {raffle.prizes?.length ? (
            <div className="prize-list">
              {raffle.prizes.map((prize) => (
                <div key={prize.id} className="prize-card">
                  {prize.image_path && (
                    <img
                      src={mediaUrl(prize.image_path)}
                      alt={prize.title}
                      className="prize-image"
                    />
                  )}

                  <div>
                    <strong>{prize.title}</strong>
                    <p>{prize.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum prêmio cadastrado.</p>
          )}
        </div>

        <div className="glass-card sticky-buy-box">
          <h2>Comprar cotas</h2>

          <label>Quantidade</label>
          <input
            type="number"
            min="1"
            max={raffle.available_numbers_count || 1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <p style={{ marginTop: 12 }}>
            Total: <strong>{money(Number(quantity || 0) * Number(raffle.price_per_ticket))}</strong>
          </p>

          <button
            onClick={handleCreateOrder}
            disabled={submitting}
            style={{
              background: raffle.design?.button_color || "#7c3aed",
              color: raffle.design?.button_text_color || "#fff",
              marginTop: 8,
              width: "100%",
            }}
          >
            {submitting ? "Criando pedido..." : "Comprar"}
          </button>

          <p style={{ marginTop: 12, opacity: 0.8 }}>
            Os números são gerados aleatoriamente após a aprovação do pedido.
          </p>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}