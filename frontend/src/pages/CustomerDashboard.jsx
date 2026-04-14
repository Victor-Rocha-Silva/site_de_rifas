import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import { money } from "../utils/format";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get("/customer/orders");
        setOrders(response.data);
      } catch {
        setError("Erro ao carregar seu painel.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.status === "paid").length;
    const pendingOrders = orders.filter((order) => order.status !== "paid").length;
    const totalSpent = orders.reduce(
      (acc, order) => acc + Number(order.total_amount || 0),
      0
    );
    const totalNumbers = orders.reduce(
      (acc, order) => acc + (order.numbers?.length || 0),
      0
    );

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalSpent,
      totalNumbers,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <section className="customer-hero-card">
          <div>
            <span className="hero-badge">Área do cliente</span>
            <h1>Olá, {user?.name}</h1>
            <p>
              Aqui você acompanha seus pedidos, seus números recebidos e o
              andamento das suas participações.
            </p>
          </div>

          <div className="customer-profile-mini">
            <div className="customer-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              <small>{user?.phone || "Telefone não informado"}</small>
            </div>
          </div>
        </section>

        {loading && <p>Carregando painel...</p>}
        {error && <p className="error">{error}</p>}

        <section className="customer-metrics-grid">
          <div className="customer-metric-card">
            <span>Pedidos</span>
            <strong>{metrics.totalOrders}</strong>
          </div>

          <div className="customer-metric-card">
            <span>Pagos</span>
            <strong>{metrics.paidOrders}</strong>
          </div>

          <div className="customer-metric-card">
            <span>Pendentes</span>
            <strong>{metrics.pendingOrders}</strong>
          </div>

          <div className="customer-metric-card">
            <span>Números recebidos</span>
            <strong>{metrics.totalNumbers}</strong>
          </div>

          <div className="customer-metric-card highlight">
            <span>Total investido</span>
            <strong>{money(metrics.totalSpent)}</strong>
          </div>
        </section>

        <section className="customer-dashboard-layout">
          <div className="glass-card">
            <div className="section-title-row">
              <div>
                <h2>Pedidos recentes</h2>
                <p>Veja suas compras mais recentes.</p>
              </div>

              <Link to="/cliente/pedidos">
                <button>Ver todos</button>
              </Link>
            </div>

            {recentOrders.length ? (
              <div className="customer-order-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="customer-order-row">
                    <div>
                      <strong>{order.raffle?.title}</strong>
                      <p>Pedido: {order.public_id}</p>
                    </div>

                    <div>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <strong>{money(order.total_amount)}</strong>
                      <p>{order.quantity} cota(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Você ainda não possui pedidos.</p>
            )}
          </div>

          <div className="glass-card">
            <h2>Seus números</h2>
            <p className="muted-text">
              Os números aparecem aqui assim que o pedido for aprovado.
            </p>

            <div className="customer-number-wall">
              {orders
                .flatMap((order) => order.numbers || [])
                .slice(0, 18)
                .map((item) => (
                  <div key={item.id} className="number-chip">
                    {item.number}
                  </div>
                ))}

              {!orders.flatMap((order) => order.numbers || []).length && (
                <p>Nenhum número recebido ainda.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}