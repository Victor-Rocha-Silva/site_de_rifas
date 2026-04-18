import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import PageLoader from "../components/PageLoader";
import { money } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get("/customer/orders");
        setOrders(response.data || []);
      } catch {
        setError("Não foi possível carregar sua área.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.status === "paid").length;
    const pendingOrders = orders.filter(
      (order) => order.status === "pending_payment"
    ).length;

    const confirmedTotal = orders
      .filter((order) => order.status === "paid")
      .reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

    const latestNumbers = orders
      .filter((order) => Array.isArray(order.numbers) && order.numbers.length > 0)
      .flatMap((order) =>
        order.numbers.map((item) => ({
          id: `${order.id}-${item.id}`,
          number: item.number,
          raffleTitle: order.raffle?.title || "Rifa",
          status: order.status,
        }))
      )
      .slice(0, 12);

    const latestOrders = orders.slice(0, 4);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      confirmedTotal,
      latestNumbers,
      latestOrders,
    };
  }, [orders]);

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <section className="customer-hero-card">
          <div>
            <span className="hero-badge">Área do cliente</span>
            <h1>Acompanhe seus pedidos e números em um só lugar.</h1>
            <p>
              Veja seus pedidos pagos, pendentes e os últimos números recebidos
              sem precisar procurar em várias páginas.
            </p>

            <div className="admin-hero-actions">
              <Link to="/rifas">
                <button>Ver rifas</button>
              </Link>

              <Link to="/cliente/pedidos">
                <button className="secondary-btn">Meus pedidos</button>
              </Link>
            </div>
          </div>
        </section>

        {loading && (
          <PageLoader
            title="Carregando sua área"
            description="Estamos organizando seus pedidos e números."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && (
          <>
            <section className="customer-metrics-grid">
              <div className="customer-metric-card">
                <span>Total de pedidos</span>
                <strong>{metrics.totalOrders}</strong>
              </div>

              <div className="customer-metric-card">
                <span>Pedidos pagos</span>
                <strong>{metrics.paidOrders}</strong>
              </div>

              <div className="customer-metric-card">
                <span>Pedidos pendentes</span>
                <strong>{metrics.pendingOrders}</strong>
              </div>

              <div className="customer-metric-card highlight">
                <span>Total confirmado</span>
                <strong>{money(metrics.confirmedTotal)}</strong>
              </div>
            </section>

            <section className="customer-dashboard-layout">
              <div className="glass-card">
                <div className="section-title-row">
                  <div>
                    <h2>Últimos pedidos</h2>
                    <p>Resumo rápido das suas compras mais recentes.</p>
                  </div>

                  <Link to="/cliente/pedidos">
                    <button>Ver todos</button>
                  </Link>
                </div>

                {!metrics.latestOrders.length ? (
                  <EmptyState
                    title="Nenhum pedido ainda"
                    description="Assim que você participar de uma rifa, seus pedidos aparecerão aqui."
                    action={
                      <Link to="/rifas">
                        <button>Explorar rifas</button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="customer-order-list">
                    {metrics.latestOrders.map((order) => (
                      <div key={order.id} className="customer-order-row">
                        <div>
                          <strong>{order.raffle?.title || "Rifa"}</strong>
                          <p>Pedido: {order.public_id}</p>
                        </div>

                        <div>
                          <span className={`status-badge ${order.status}`}>
                            {formatStatusLabel(order.status)}
                          </span>
                        </div>

                        <div>
                          <strong>{money(order.total_amount)}</strong>
                          <p>{order.quantity} cota(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card">
                <div className="section-title-row">
                  <div>
                    <h2>Últimos números</h2>
                    <p>Os números mais recentes recebidos por você.</p>
                  </div>
                </div>

                {!metrics.latestNumbers.length ? (
                  <InlineNotice type="warning" title="Sem números gerados">
                    Quando um pedido for aprovado, seus números aparecerão aqui.
                  </InlineNotice>
                ) : (
                  <>
                    <div className="customer-number-wall big">
                      {metrics.latestNumbers.map((item) => (
                        <div key={item.id} className="number-chip">
                          {item.number}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16 }}>
                      {metrics.latestNumbers.slice(0, 4).map((item) => (
                        <p
                          key={`${item.id}-label`}
                          className="muted-text"
                          style={{ margin: "6px 0" }}
                        >
                          {item.number} • {item.raffleTitle}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}