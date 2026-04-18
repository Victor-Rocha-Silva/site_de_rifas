import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import { formatStatusLabel } from "../utils/status";

export default function CustomerRaffles() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRaffles() {
      try {
        const response = await api.get("/customer/raffles");
        setRaffles(response.data);
      } catch {
        setError("Não foi possível carregar suas rifas.");
      } finally {
        setLoading(false);
      }
    }

    loadRaffles();
  }, []);

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="page-header">
          <h1>Minhas rifas</h1>
          <p>Aqui seus pedidos ficam agrupados por rifa.</p>
        </div>

        {loading && (
          <PageLoader
            title="Carregando rifas"
            description="Estamos agrupando suas participações."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && !raffles.length && (
          <EmptyState
            title="Você ainda não participou de nenhuma rifa"
            description="Quando participar, elas aparecerão aqui separadas por rifa."
          />
        )}

        {!loading && !error && raffles.length > 0 && (
          <div className="grid">
            {raffles.map((raffle) => (
              <div key={raffle.id} className="glass-card">
                <div className="card-row">
                  <div>
                    <h2>{raffle.title}</h2>
                    <p>{raffle.orders_count} pedido(s) nesta rifa</p>
                  </div>

                  <span className={`status-badge ${raffle.status}`}>
                    {formatStatusLabel(raffle.status)}
                  </span>
                </div>

                <div className="customer-order-meta-grid">
                  <div className="customer-order-meta-box">
                    <span>Seus números</span>
                    <strong>{raffle.my_numbers_count}</strong>
                  </div>

                  <div className="customer-order-meta-box">
                    <span>Vendidos</span>
                    <strong>{raffle.sold_numbers_count}</strong>
                  </div>

                  <div className="customer-order-meta-box">
                    <span>Total</span>
                    <strong>{raffle.total_numbers}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <p className="muted-text" style={{ marginBottom: 8 }}>
                    Seus números nesta rifa
                  </p>

                  <div className="customer-number-wall">
                    {raffle.my_numbers.map((number) => (
                      <div key={number} className="number-chip">
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <Link to={`/cliente/rifas/${raffle.id}`}>
                    <button>Ver mapa da rifa</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}