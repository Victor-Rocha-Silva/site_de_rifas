import { useEffect, useState } from "react";
import api from "../services/api";
import { money } from "../utils/format";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  async function loadOrders() {
    try {
      const params = {};

      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await api.get("/admin/orders", { params });
      setOrders(response.data);
    } catch {
      setError("Erro ao carregar pedidos.");
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
    setMessage("");
    setProcessingId(orderId);

    try {
      await api.post(`/admin/orders/${orderId}/mark-as-paid`, {
        payment_provider: "manual",
        payment_reference: `MANUAL-${orderId}`,
        payment_id: `PAG-${orderId}`,
      });

      setMessage("Pedido aprovado com sucesso.");
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao aprovar pedido.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Pedidos</h1>
        <p>Gerencie e aprove os pedidos pendentes.</p>
      </div>

      <div className="glass-card">
        <h2>Filtros</h2>

        <label>Status</label>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos</option>
          <option value="pending_payment">Pendentes</option>
          <option value="paid">Pagos</option>
        </select>

        <br /><br />

        <label>Busca</label>
        <input
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Cliente, e-mail, telefone, pedido ou rifa"
        />

        <br /><br />

        <button onClick={loadOrders}>Buscar</button>
      </div>

      {loading && <p>Carregando...</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {orders.map((order) => (
          <div key={order.id} className="glass-card">
            <div className="card-row">
              <div>
                <h2>Pedido #{order.id}</h2>
                <p>{order.raffle?.title}</p>
              </div>

              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>

            <p>Cliente: {order.customer?.name}</p>
            <p>Quantidade: {order.quantity}</p>
            <p>Total: {money(order.total_amount)}</p>

            <p>
              Números:{" "}
              {order.numbers?.length
                ? order.numbers.map((n) => n.number).join(", ")
                : "Nenhum número gerado ainda"}
            </p>

            {order.status !== "paid" && (
              <button
                onClick={() => approveOrder(order.id)}
                disabled={processingId === order.id}
              >
                {processingId === order.id ? "Aprovando..." : "Aprovar pagamento"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}