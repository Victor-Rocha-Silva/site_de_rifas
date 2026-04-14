import { useEffect, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import PageLoader from "../components/PageLoader";
import { useToast } from "../context/ToastContext";
import { money } from "../utils/format";

export default function AdminOrders() {
  const { success, error: showError, info } = useToast();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  async function loadOrders(showInfoMessage = false) {
    try {
      const params = {};

      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await api.get("/admin/orders", { params });
      setOrders(response.data);

      if (showInfoMessage) {
        info("Lista atualizada", "Os pedidos foram carregados novamente.");
      }
    } catch {
      const message = "Não foi possível carregar os pedidos.";
      setError(message);
      showError("Erro nos pedidos", message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [filters.status]);

  function handleFilterChange(e) {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function approveOrder(orderId) {
    setError("");
    setProcessingId(orderId);

    try {
      await api.post(`/admin/orders/${orderId}/mark-as-paid`, {
        payment_provider: "manual",
        payment_reference: `MANUAL-${orderId}`,
        payment_id: `PAG-${orderId}`,
      });

      success(
        "Pedido aprovado",
        `O pedido #${orderId} foi aprovado e os números foram gerados.`
      );

      await loadOrders();
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao aprovar pedido.";
      setError(message);
      showError("Falha na aprovação", message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <div className="page-header">
          <h1>Pedidos</h1>
          <p>Gerencie os pedidos e aprove os pagamentos pendentes.</p>
        </div>

        <div className="glass-card admin-filter-card">
          <div className="section-title-row">
            <div>
              <h2>Filtros</h2>
              <p>Busque por cliente, rifa, e-mail ou referência.</p>
            </div>
          </div>

          <div className="admin-filter-grid">
            <div>
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">Todos</option>
                <option value="pending_payment">Pendentes</option>
                <option value="paid">Pagos</option>
              </select>
            </div>

            <div>
              <label>Busca</label>
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Cliente, e-mail, telefone, pedido ou rifa"
              />
            </div>

            <div className="admin-filter-button-wrap">
              <button onClick={() => loadOrders(true)}>Buscar</button>
            </div>
          </div>
        </div>

        {loading && (
          <PageLoader
            title="Carregando pedidos"
            description="Estamos organizando a fila de pedidos para você."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && !orders.length && (
          <EmptyState
            title="Nenhum pedido encontrado"
            description="Ainda não há pedidos com os filtros aplicados."
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="grid">
            {orders.map((order) => (
              <div key={order.id} className="glass-card admin-order-card-premium">
                <div className="card-row">
                  <div>
                    <h2>Pedido #{order.id}</h2>
                    <p>{order.raffle?.title}</p>
                  </div>

                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="admin-order-meta-grid">
                  <div className="admin-order-meta-box">
                    <span>Cliente</span>
                    <strong>{order.customer?.name || "Cliente"}</strong>
                  </div>

                  <div className="admin-order-meta-box">
                    <span>Quantidade</span>
                    <strong>{order.quantity}</strong>
                  </div>

                  <div className="admin-order-meta-box">
                    <span>Total</span>
                    <strong>{money(order.total_amount)}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <p className="muted-text" style={{ marginBottom: 8 }}>
                    Números vinculados
                  </p>

                  <div className="customer-number-wall">
                    {order.numbers?.length ? (
                      order.numbers.map((n) => (
                        <div key={n.id} className="number-chip">
                          {n.number}
                        </div>
                      ))
                    ) : (
                      <InlineNotice type="warning" title="Pedido pendente">
                        Nenhum número foi gerado para este pedido ainda.
                      </InlineNotice>
                    )}
                  </div>
                </div>

                {order.status !== "paid" && (
                  <div style={{ marginTop: 18 }}>
                    <button
                      onClick={() => approveOrder(order.id)}
                      disabled={processingId === order.id}
                    >
                      {processingId === order.id ? "Aprovando..." : "Aprovar pagamento"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}