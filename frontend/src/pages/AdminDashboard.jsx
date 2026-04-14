import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import { money } from "../utils/format";

export default function AdminDashboard() {
  const [raffles, setRaffles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [rafflesResponse, ordersResponse] = await Promise.all([
          api.get("/admin/raffles"),
          api.get("/admin/orders"),
        ]);

        setRaffles(rafflesResponse.data);
        setOrders(ordersResponse.data);
      } catch {
        setError("Erro ao carregar o painel admin.");
      }
    }

    loadData();
  }, []);

  const metrics = useMemo(() => {
    const totalRaffles = raffles.length;
    const activeRaffles = raffles.filter((item) => item.status === "active").length;
    const totalOrders = orders.length;
    const paidOrders = orders.filter((item) => item.status === "paid").length;
    const pendingOrders = orders.filter((item) => item.status !== "paid").length;
    const totalRevenue = orders
      .filter((item) => item.status === "paid")
      .reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

    return {
      totalRaffles,
      activeRaffles,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue,
    };
  }, [raffles, orders]);

  const latestOrders = orders.slice(0, 5);
  const latestRaffles = raffles.slice(0, 4);

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <section className="admin-hero-card">
          <div>
            <span className="hero-badge">Painel administrativo</span>
            <h1>Controle total das suas rifas em um só lugar.</h1>
            <p>
              Gerencie rifas, acompanhe pedidos, aprove pagamentos e mantenha
              tudo organizado no seu painel privado.
            </p>

            <div className="admin-hero-actions">
              <Link to="/admin/rifas/nova">
                <button>Nova rifa</button>
              </Link>

              <Link to="/admin/pedidos">
                <button className="secondary-btn">Ver pedidos</button>
              </Link>
            </div>
          </div>

          <div className="admin-hero-side">
            <div className="admin-hero-mini-card">
              <span>Rifas ativas</span>
              <strong>{metrics.activeRaffles}</strong>
            </div>

            <div className="admin-hero-mini-card">
              <span>Pedidos pagos</span>
              <strong>{metrics.paidOrders}</strong>
            </div>
          </div>
        </section>

        {error && <p className="error">{error}</p>}

        <section className="admin-metrics-grid">
          <div className="admin-metric-card">
            <span>Total de rifas</span>
            <strong>{metrics.totalRaffles}</strong>
          </div>

          <div className="admin-metric-card">
            <span>Rifas ativas</span>
            <strong>{metrics.activeRaffles}</strong>
          </div>

          <div className="admin-metric-card">
            <span>Total de pedidos</span>
            <strong>{metrics.totalOrders}</strong>
          </div>

          <div className="admin-metric-card">
            <span>Pedidos pendentes</span>
            <strong>{metrics.pendingOrders}</strong>
          </div>

          <div className="admin-metric-card highlight">
            <span>Receita confirmada</span>
            <strong>{money(metrics.totalRevenue)}</strong>
          </div>
        </section>

        <section className="admin-dashboard-layout">
          <div className="glass-card">
            <div className="section-title-row">
              <div>
                <h2>Últimos pedidos</h2>
                <p>Veja rapidamente o status dos pedidos recentes.</p>
              </div>

              <Link to="/admin/pedidos">
                <button>Ir para pedidos</button>
              </Link>
            </div>

            {latestOrders.length ? (
              <div className="admin-list-grid">
                {latestOrders.map((order) => (
                  <div key={order.id} className="admin-row-card">
                    <div>
                      <strong>Pedido #{order.id}</strong>
                      <p>{order.raffle?.title}</p>
                    </div>

                    <div>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <strong>{money(order.total_amount)}</strong>
                      <p>{order.customer?.name || "Cliente"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum pedido encontrado.</p>
            )}
          </div>

          <div className="glass-card">
            <div className="section-title-row">
              <div>
                <h2>Rifas recentes</h2>
                <p>Resumo das últimas rifas cadastradas.</p>
              </div>

              <Link to="/admin/rifas">
                <button>Ver rifas</button>
              </Link>
            </div>

            {latestRaffles.length ? (
              <div className="admin-simple-list">
                {latestRaffles.map((raffle) => (
                  <div key={raffle.id} className="admin-simple-item">
                    <div>
                      <strong>{raffle.title}</strong>
                      <p>{raffle.total_numbers} números</p>
                    </div>

                    <span className={`status-badge ${raffle.status}`}>
                      {raffle.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma rifa cadastrada.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}