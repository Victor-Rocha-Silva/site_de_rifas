import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { money } from "../utils/format";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get("/customer/orders");
        setOrders(response.data);
      } catch {
        setError("Erro ao carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Meus pedidos</h1>
        <p>Acompanhe o status e os números recebidos.</p>
      </div>

      {loading && <p>Carregando pedidos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {orders.map((order) => (
          <div key={order.id} className="glass-card">
            <div className="card-row">
              <div>
                <h2>{order.raffle?.title}</h2>
                <p>Pedido: {order.public_id}</p>
              </div>

              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>

            <p>Quantidade: {order.quantity}</p>
            <p>Total: {money(order.total_amount)}</p>

            <p>
              Números:{" "}
              {order.numbers?.length
                ? order.numbers.map((item) => item.number).join(", ")
                : "Nenhum número gerado ainda"}
            </p>

            <div style={{ marginTop: 14 }}>
              <Link to={`/cliente/pedidos/${order.public_id}`}>
                <button>Ver detalhes</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}