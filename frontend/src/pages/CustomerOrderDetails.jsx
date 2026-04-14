import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { money } from "../utils/format";

export default function CustomerOrderDetails() {
  const { publicId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await api.get(`/customer/orders/${publicId}`);
        setOrder(response.data);
      } catch {
        setError("Erro ao carregar os detalhes do pedido.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [publicId]);

  if (loading) {
    return <div className="container">Carregando pedido...</div>;
  }

  if (error || !order) {
    return <div className="container"><p className="error">{error || "Pedido não encontrado."}</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Detalhes do pedido</h1>
        <p>Referência pública: {order.public_id}</p>
      </div>

      <div className="glass-card">
        <h2>{order.raffle?.title}</h2>
        <p>Status: <span className={`status-badge ${order.status}`}>{order.status}</span></p>
        <p>Quantidade: {order.quantity}</p>
        <p>Total: {money(order.total_amount)}</p>
        <p>Forma de validação: {order.payment_provider || "manual"}</p>
      </div>

      <div className="glass-card">
        <h2>Números recebidos</h2>
        {order.numbers?.length ? (
          <div className="number-grid">
            {order.numbers.map((item) => (
              <div key={item.id} className="number-chip">
                {item.number}
              </div>
            ))}
          </div>
        ) : (
          <p>Ainda não há números vinculados a este pedido.</p>
        )}
      </div>
    </div>
  );
}