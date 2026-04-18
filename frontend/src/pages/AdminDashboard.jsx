import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import { money } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

export default function AdminDashboard() {
  const [raffles, setRaffles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [rafflesResponse, ordersResponse] = await Promise.all([
          api.get("/admin/raffles", { params: { show_archived: true } }),
          api.get("/admin/orders"),
        ]);

        setRaffles(rafflesResponse.data || []);
        setOrders(ordersResponse.data || []);
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
    const lucro = orders
      .filter((item) => item.status === "paid")
      .reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

    return {
      totalRaffles,
      activeRaffles,
      totalOrders,
      paidOrders,
      pendingOrders,
      lucro,
    };
  }, [raffles, orders]);

  const latestOrders = orders.slice(0, 5);

  const rafflesWithOrderCount = useMemo(() => {
    return raffles
      .map((raffle) => {
        const raffleOrders = orders.filter((order) => order.raffle?.id === raffle.id);
        const paidCount = raffleOrders.filter((order) => order.status === "paid").length;
        const pendingCount = raffleOrders.filter((order) => order.status !== "paid").length;

        return {
          ...raffle,
          orders_count: raffleOrders.length,
          paid_orders_count: paidCount,
          pending_orders_count: pendingCount,
        };
      })
      .sort((a, b) => b.orders_count - a.orders_count)
      .slice(0, 6);
  }, [raffles, orders]);

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <section className="admin-hero-card">
          <div>
            <span className="hero-badge">Painel administrativo</span>
            <h1>Controle total das suas rifas em um só lugar.</h1>
            <p>
              Gerencie rifas, acompanhe pedidos e pagamentos, mantenha
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
            <span>Lucro</span>
            <strong>{money(metrics.lucro)}</strong>
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
                        {formatStatusLabel(order.status)}
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
                <h2>Pedidos por rifa</h2>
                <p>Clique na rifa para abrir os pedidos feitos nela.</p>
              </div>

              <Link to="/admin/rifas">
                <button>Ver rifas</button>
              </Link>
            </div>

            {rafflesWithOrderCount.length ? (
              <div className="admin-simple-list">
                {rafflesWithOrderCount.map((raffle) => (
                  <Link
                    key={raffle.id}
                    to={`/admin/rifas/${raffle.id}/pedidos`}
                    className="admin-simple-item"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div>
                      <strong>{raffle.title}</strong>
                      <p>
                        {raffle.orders_count} pedido(s) • pagos: {raffle.paid_orders_count} • pendentes: {raffle.pending_orders_count}
                      </p>
                    </div>

                    <span className={`status-badge ${raffle.status}`}>
                      {formatStatusLabel(raffle.status)}
                    </span>
                  </Link>
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