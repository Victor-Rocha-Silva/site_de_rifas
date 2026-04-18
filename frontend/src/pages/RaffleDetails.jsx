import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import FloatingBackground from "../components/FloatingBackground";
import ProgressBar from "../components/ProgressBar";
import { mediaUrl, money, raffleProgress } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

function formatDate(dateValue) {
  if (!dateValue) return "Não definido";

  try {
    return new Date(dateValue).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "Não definido";
  }
}

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
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState(0);

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

  const progress = useMemo(() => raffleProgress(raffle), [raffle]);

  const selectedPrize =
    raffle?.prizes?.length ? raffle.prizes[selectedPrizeIndex] : null;

  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, Number(prev) - 1));
  }

  function increaseQuantity() {
    const max = Number(raffle?.available_numbers_count || 1);
    setQuantity((prev) => Math.min(max, Number(prev) + 1));
  }

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

  return (
    <div className="raffle-premium-page">
      <FloatingBackground />

      <div className="container raffle-premium-container">
        <div className="raffle-breadcrumb">
          <Link to="/rifas">Rifas</Link>
          <span>/</span>
          <span>{raffle.title}</span>
        </div>

        <section className="raffle-premium-hero">
          <div className="raffle-premium-main">
            {raffle.banner_path ? (
              <div className="raffle-premium-banner">
                <img src={mediaUrl(raffle.banner_path)} alt={raffle.title} />
              </div>
            ) : (
              <div className="raffle-premium-banner raffle-premium-banner-empty">
                <span>Banner da rifa</span>
              </div>
            )}

            <div
              className="raffle-premium-panel"
              style={{
                background: raffle.design?.background_color || "#0f172a",
                color: raffle.design?.text_color || "#ffffff",
              }}
            >
              <div className="raffle-premium-top">
                <div className="raffle-premium-identity">
                  {raffle.logo_path ? (
                    <img
                      src={mediaUrl(raffle.logo_path)}
                      alt="Logo da rifa"
                      className="raffle-premium-logo"
                    />
                  ) : (
                    <div className="raffle-premium-logo raffle-premium-logo-empty">
                      Logo
                    </div>
                  )}

                  <div>
                    <span className="raffle-mini-badge">Rifa online</span>
                    <h1>{raffle.title}</h1>
                    <p>{raffle.subtitle || "Participe e acompanhe tudo online."}</p>
                  </div>
                </div>

                <span className={`status-badge ${raffle.status || "active"}`}>
                  {formatStatusLabel(raffle.status || "active")}
                </span>
              </div>

              <p className="raffle-premium-description">
                {raffle.description || "Sem descrição cadastrada."}
              </p>

              <div className="raffle-premium-info-grid">
                <div className="raffle-info-card">
                  <span>Valor por cota</span>
                  <strong>{money(raffle.price_per_ticket)}</strong>
                </div>

                <div className="raffle-info-card">
                  <span>Total de números</span>
                  <strong>{raffle.total_numbers}</strong>
                </div>

                <div className="raffle-info-card">
                  <span>Disponíveis</span>
                  <strong>{raffle.available_numbers_count}</strong>
                </div>

                <div className="raffle-info-card">
                  <span>Vendidos</span>
                  <strong>{raffle.sold_numbers_count}</strong>
                </div>
              </div>

              <div className="raffle-progress-box">
                <div className="progress-label">
                  <span>Progresso da rifa</span>
                  <strong>{progress}%</strong>
                </div>
                <ProgressBar value={progress} />
              </div>

              <div className="raffle-meta-grid">
                <div className="raffle-meta-item">
                  <span>Início</span>
                  <strong>{formatDate(raffle.starts_at)}</strong>
                </div>

                <div className="raffle-meta-item">
                  <span>Encerramento</span>
                  <strong>{formatDate(raffle.ends_at)}</strong>
                </div>

                <div className="raffle-meta-item">
                  <span>Sorteio</span>
                  <strong>{formatDate(raffle.draw_at)}</strong>
                </div>

                <div className="raffle-meta-item">
                  <span>Instagram</span>
                  <strong>
                    {raffle.instagram_url ? (
                      <a href={raffle.instagram_url} target="_blank" rel="noreferrer">
                        Acessar
                      </a>
                    ) : (
                      "Não informado"
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <aside className="raffle-premium-sidebar">
            <div className="raffle-buy-card">
              <span className="raffle-buy-badge">Compra rápida</span>
              <h2>Escolha quantas cotas deseja</h2>
              <p>
                Os números são gerados aleatoriamente após a aprovação do pedido.
              </p>

              <div className="raffle-qty-box">
                <button type="button" onClick={decreaseQuantity}>
                  -
                </button>

                <input
                  type="number"
                  min="1"
                  max={raffle.available_numbers_count || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <button type="button" onClick={increaseQuantity}>
                  +
                </button>
              </div>

              <div className="raffle-buy-summary">
                <div>
                  <span>Quantidade</span>
                  <strong>{quantity}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    {money(Number(quantity || 0) * Number(raffle.price_per_ticket))}
                  </strong>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={submitting}
                className="raffle-buy-button"
                style={{
                  background: raffle.design?.button_color || "#7c3aed",
                  color: raffle.design?.button_text_color || "#ffffff",
                }}
              >
                {submitting ? "Criando pedido..." : "Comprar cotas"}
              </button>

              {!user && (
                <p className="raffle-buy-note">
                  Para continuar, faça login ou crie sua conta.
                </p>
              )}

              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
            </div>

            <div className="raffle-help-card">
              <h3>Como funciona</h3>

              <div className="raffle-help-step">
                <strong>1.</strong>
                <span>Você escolhe a quantidade de cotas.</span>
              </div>

              <div className="raffle-help-step">
                <strong>2.</strong>
                <span>O pedido é registrado na sua conta.</span>
              </div>

              <div className="raffle-help-step">
                <strong>3.</strong>
                <span>Após aprovação, os números ficam visíveis no seu painel.</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="raffle-premium-sections">
          <div className="raffle-premium-content">
            <div className="glass-card">
              <div className="section-title-row">
                <div>
                  <h2>Prêmios da rifa</h2>
                  <p>Veja o que está em disputa.</p>
                </div>
              </div>

              {raffle.prizes?.length ? (
                <div className="raffle-prize-layout">
                  <div className="raffle-prize-gallery">
                    {raffle.prizes.map((prize, index) => (
                      <button
                        type="button"
                        key={prize.id}
                        className={`raffle-prize-tab ${
                          selectedPrizeIndex === index ? "active" : ""
                        }`}
                        onClick={() => setSelectedPrizeIndex(index)}
                      >
                        <span>{index + 1}</span>
                        <strong>{prize.title}</strong>
                      </button>
                    ))}
                  </div>

                  <div className="raffle-prize-highlight">
                    {selectedPrize?.image_path ? (
                      <img
                        src={mediaUrl(selectedPrize.image_path)}
                        alt={selectedPrize.title}
                        className="raffle-prize-highlight-image"
                      />
                    ) : (
                      <div className="raffle-prize-highlight-image raffle-prize-highlight-image-empty">
                        Imagem do prêmio
                      </div>
                    )}

                    <div className="raffle-prize-highlight-content">
                      <h3>{selectedPrize?.title || "Prêmio"}</h3>
                      <p>
                        {selectedPrize?.description ||
                          "Descrição do prêmio não informada."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Nenhum prêmio cadastrado.</p>
              )}
            </div>

            <div className="glass-card">
              <h2>Por que participar aqui?</h2>

              <div className="raffle-why-grid">
                <div className="raffle-why-card">
                  <strong>Visualização clara</strong>
                  <p>Você acompanha tudo dentro da sua conta, sem bagunça.</p>
                </div>

                <div className="raffle-why-card">
                  <strong>Histórico centralizado</strong>
                  <p>Todos os pedidos e números ficam salvos no seu painel.</p>
                </div>

                <div className="raffle-why-card">
                  <strong>Rifa personalizada</strong>
                  <p>Cada campanha tem identidade própria, banner e prêmios.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}