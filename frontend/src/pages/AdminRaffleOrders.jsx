import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import { money } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

export default function AdminRaffleOrders() {
  const { raffleId } = useParams();

  const [raffle, setRaffle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get(`/admin/raffles/${raffleId}/orders`);
        setRaffle(response.data.raffle);
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Não foi possível carregar os pedidos desta rifa."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [raffleId]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.status === "paid").length;
    const pendingOrders = orders.filter((order) => order.status !== "paid").length;
    const lucro = orders
      .filter((order) => order.status === "paid")
      .reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      lucro,
    };
  }, [orders]);

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <div className="raffle-breadcrumb">
          <Link to="/admin">Painel</Link>
          <span>/</span>
          <Link to="/admin/rifas">Rifas</Link>
          <span>/</span>
          <span>{raffle?.title || "Pedidos da rifa"}</span>
        </div>

        <div className="page-header">
          <h1>{raffle?.title || "Pedidos da rifa"}</h1>
          <p>Veja todos os pedidos vinculados a esta rifa.</p>
        </div>

        {loading && (
          <PageLoader
            title="Carregando pedidos"
            description="Estamos buscando os pedidos desta rifa."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && raffle && (
          <>
            <section className="admin-metrics-grid">
              <div className="admin-metric-card">
                <span>Total de pedidos</span>
                <strong>{metrics.totalOrders}</strong>
              </div>

              <div className="admin-metric-card">
                <span>Pedidos pagos</span>
                <strong>{metrics.paidOrders}</strong>
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

            {!orders.length ? (
              <EmptyState
                title="Nenhum pedido nesta rifa"
                description="Quando houver pedidos vinculados, eles aparecerão aqui."
              />
            ) : (
              <div className="grid">
                {orders.map((order) => (
                  <div key={order.id} className="glass-card admin-order-card-premium">
                    <div className="card-row">
                      <div>
                        <h2>Pedido #{order.id}</h2>
                        <p>{order.customer?.name || "Cliente"}</p>
                      </div>

                      <span className={`status-badge ${order.status}`}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="admin-order-meta-grid">
                      <div className="admin-order-meta-box">
                        <span>Quantidade</span>
                        <strong>{order.quantity}</strong>
                      </div>

                      <div className="admin-order-meta-box">
                        <span>Total</span>
                        <strong>{money(order.total_amount)}</strong>
                      </div>

                      <div className="admin-order-meta-box">
                        <span>Números</span>
                        <strong>{order.numbers?.length || 0}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <p className="muted-text" style={{ marginBottom: 8 }}>
                        Números vinculados
                      </p>

                      <div className="customer-number-wall">
                        {order.numbers?.length ? (
                          order.numbers.map((item) => (
                            <div key={item.id} className="number-chip">
                              {item.number}
                            </div>
                          ))
                        ) : (
                          <p className="muted-text">Nenhum número vinculado.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}