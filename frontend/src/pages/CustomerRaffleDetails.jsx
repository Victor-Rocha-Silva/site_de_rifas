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
              <span>Seus números</span>
              <strong>{raffle.my_numbers.length}</strong>
            </div>
          </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}