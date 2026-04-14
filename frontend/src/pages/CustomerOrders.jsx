import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import PageLoader from "../components/PageLoader";
import { money } from "../utils/format";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get("/customer/orders");
        setOrders(response.data);
      } catch {
        setError("Não foi possível carregar seus pedidos.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!filter) return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="page-header">
          <h1>Meus pedidos</h1>
          <p>Acompanhe o status de cada pedido e os números recebidos.</p>
        </div>

        <div className="glass-card customer-filter-card">
          <h2>Filtrar pedidos</h2>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="pending_payment">Pendentes</option>
            <option value="paid">Pagos</option>
          </select>
        </div>

        {loading && (
          <PageLoader
            title="Carregando pedidos"
            description="Estamos buscando o histórico da sua conta."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && !filteredOrders.length && (
          <EmptyState
            title="Você ainda não possui pedidos"
            description="Assim que você participar de uma rifa, seus pedidos aparecerão aqui."
            action={
              <Link to="/rifas">
                <button>Ver rifas disponíveis</button>
              </Link>
            }
          />
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass-card customer-order-card-premium">
                <div className="card-row">
                  <div>
                    <h2>{order.raffle?.title}</h2>
                    <p>Pedido: {order.public_id}</p>
                  </div>

                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="customer-order-meta-grid">
                  <div className="customer-order-meta-box">
                    <span>Quantidade</span>
                    <strong>{order.quantity}</strong>
                  </div>

                  <div className="customer-order-meta-box">
                    <span>Total</span>
                    <strong>{money(order.total_amount)}</strong>
                  </div>

                  <div className="customer-order-meta-box">
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
                      <InlineNotice type="warning" title="Aguardando aprovação">
                        Este pedido ainda não possui números vinculados.
                      </InlineNotice>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <Link to={`/cliente/pedidos/${order.public_id}`}>
                    <button>Ver detalhes</button>
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