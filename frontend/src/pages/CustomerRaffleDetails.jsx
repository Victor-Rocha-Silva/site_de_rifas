import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import PageLoader from "../components/PageLoader";
import InlineNotice from "../components/InlineNotice";
import { formatStatusLabel } from "../utils/status";

export default function CustomerRaffleDetails() {
  const { raffleId } = useParams();

  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  useEffect(() => {
    async function loadRaffle() {
      try {
        const response = await api.get(`/customer/raffles/${raffleId}`);
        setRaffle(response.data);
      } catch {
        setError("Não foi possível carregar os dados da rifa.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffle();
  }, [raffleId]);

  const allNumbers = useMemo(() => {
    if (!raffle?.total_numbers) return [];
    return Array.from({ length: raffle.total_numbers }, (_, index) => index + 1);
  }, [raffle]);

  const soldSet = useMemo(() => {
    return new Set((raffle?.sold_numbers || []).map(Number));
  }, [raffle]);

  const mySet = useMemo(() => {
    return new Set((raffle?.my_numbers || []).map(Number));
  }, [raffle]);

  const availableCount = useMemo(() => {
    if (!raffle?.total_numbers) return 0;
    return raffle.total_numbers - (raffle?.sold_numbers?.length || 0);
  }, [raffle]);

  const ticketPrice = useMemo(() => {
    if (!raffle) return 0;

    return Number(
      raffle.ticket_price ??
        raffle.price ??
        raffle.unit_price ??
        raffle.value ??
        0
    );
  }, [raffle]);

  const totalAmount = useMemo(() => {
    return ticketPrice * Number(quantity || 0);
  }, [ticketPrice, quantity]);

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function handleBuy() {
    try {
      setBuying(true);
      setBuyError("");

      if (!raffle?.id) {
        setBuyError("Rifa inválida.");
        return;
      }

      if (!quantity || Number(quantity) < 1) {
        setBuyError("Escolha pelo menos 1 número.");
        return;
      }

      if (Number(quantity) > availableCount) {
        setBuyError("Não há números disponíveis suficientes.");
        return;
      }

      const response = await api.post("/orders", {
        raffle_id: raffle.id,
        quantity: Number(quantity),
      });

      const checkoutUrl = response.data.checkout_url;

      if (!checkoutUrl) {
        setBuyError("Não foi possível gerar o link de pagamento.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        "Erro ao criar pagamento. Tente novamente.";

      setBuyError(message);
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="customer-premium-page">
        <FloatingBackground />
        <div className="container customer-premium-container">
          <PageLoader
            title="Carregando mapa da rifa"
            description="Estamos organizando os números para você."
          />
        </div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="customer-premium-page">
        <FloatingBackground />
        <div className="container customer-premium-container">
          <InlineNotice type="error" title="Erro ao carregar">
            {error || "Rifa não encontrada."}
          </InlineNotice>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="raffle-breadcrumb">
          <Link to="/cliente/rifas">Minhas rifas</Link>
          <span>/</span>
          <span>{raffle.title}</span>
        </div>

        <div className="page-header">
          <h1>{raffle.title}</h1>
          <p>Todos os números desta rifa em ordem.</p>
        </div>

        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div className="card-row">
            <div>
              <h2>Resumo da rifa</h2>
              <p>Status atual da sua participação.</p>
            </div>

            <span className={`status-badge ${raffle.status}`}>
              {formatStatusLabel(raffle.status)}
            </span>
          </div>

          <div className="customer-order-meta-grid" style={{ marginTop: 18 }}>
            <div className="customer-order-meta-box">
              <span>Total de números</span>
              <strong>{raffle.total_numbers}</strong>
            </div>

            <div className="customer-order-meta-box">
              <span>Vendidos</span>
              <strong>{raffle.sold_numbers.length}</strong>
            </div>

            <div className="customer-order-meta-box">
              <span>Disponíveis</span>
              <strong>{availableCount}</strong>
            </div>

            <div className="customer-order-meta-box">
              <span>Seus números</span>
              <strong>{raffle.my_numbers.length}</strong>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div className="card-row">
            <div>
              <h2>Comprar números</h2>
              <p>Escolha a quantidade e finalize pelo Mercado Pago.</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="muted-text">Valor por número</span>
              <h3 style={{ marginTop: 4 }}>{formatMoney(ticketPrice)}</h3>
            </div>
          </div>

          {buyError && (
            <div style={{ marginTop: 16 }}>
              <InlineNotice type="error" title="Erro na compra">
                {buyError}
              </InlineNotice>
            </div>
          )}

          <div
            className="customer-order-meta-grid"
            style={{ marginTop: 18, alignItems: "end" }}
          >
            <div className="customer-order-meta-box">
              <span>Quantidade</span>

              <input
                type="number"
                min="1"
                max={availableCount}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "inherit",
                  outline: "none",
                  fontSize: 16,
                }}
              />
            </div>

            <div className="customer-order-meta-box">
              <span>Total</span>
              <strong>{formatMoney(totalAmount)}</strong>
            </div>

            <div className="customer-order-meta-box">
              <span>Pagamento</span>

              <button
                type="button"
                onClick={handleBuy}
                disabled={buying || availableCount <= 0}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  cursor: buying || availableCount <= 0 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  background:
                    buying || availableCount <= 0
                      ? "rgba(255,255,255,0.25)"
                      : "linear-gradient(135deg, #7c3aed, #ec4899)",
                  color: "#fff",
                }}
              >
                {buying ? "Gerando pagamento..." : "Comprar agora"}
              </button>
            </div>
          </div>

          {availableCount <= 0 && (
            <p className="muted-text" style={{ marginTop: 14 }}>
              Essa rifa não possui números disponíveis no momento.
            </p>
          )}
        </div>

        <div className="glass-card" style={{ marginBottom: 20 }}>
          <h2>Legenda</h2>

          <div className="raffle-map-legend">
            <div className="raffle-legend-item">
              <span className="raffle-map-number">00</span>
              <small>Disponível</small>
            </div>

            <div className="raffle-legend-item">
              <span className="raffle-map-number sold">00</span>
              <small>Vendido</small>
            </div>

            <div className="raffle-legend-item">
              <span className="raffle-map-number mine">00</span>
              <small>Seu número</small>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2>Mapa de números</h2>
          <p className="muted-text">
            Vendidos em verde. Os seus ficam destacados.
          </p>

          <div className="raffle-map-grid">
            {allNumbers.map((number) => {
              const isSold = soldSet.has(number);
              const isMine = mySet.has(number);

              return (
                <div
                  key={number}
                  className={`raffle-map-number ${
                    isSold ? "sold" : ""
                  } ${isMine ? "mine" : ""}`}
                >
                  {number}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ marginTop: 20 }}>
          <h2>Seus pedidos nesta rifa</h2>

          <div className="grid" style={{ marginTop: 16 }}>
            {raffle.orders.map((order) => (
              <div key={order.id} className="glass-card">
                <div className="card-row">
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <p>{order.quantity} cota(s)</p>
                  </div>

                  <span className={`status-badge ${order.status}`}>
                    {formatStatusLabel(order.status)}
                  </span>
                </div>

                <div className="customer-number-wall" style={{ marginTop: 12 }}>
                  {order.numbers?.map((item) => (
                    <div key={item.id} className="number-chip">
                      {item.number}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {raffle.orders.length === 0 && (
              <p className="muted-text">
                Você ainda não fez pedidos nesta rifa.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}