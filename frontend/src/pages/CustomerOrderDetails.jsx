import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import { money } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

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
    return (
      <div className="container">
        <p className="error">{error || "Pedido não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="raffle-breadcrumb">
          <Link to="/cliente/pedidos">Meus pedidos</Link>
          <span>/</span>
          <span>{order.public_id}</span>
        </div>

        <div className="page-header">
          <h1>Detalhes do pedido</h1>
          <p>Confira as informações completas do seu pedido.</p>
        </div>

        <div className="customer-order-detail-layout">
          <div className="glass-card">
            <div className="card-row">
              <div>
                <h2>{order.raffle?.title}</h2>
                <p>Referência pública: {order.public_id}</p>
              </div>

              <span className={`status-badge ${order.status}`}>
                {formatStatusLabel(order.status)}
              </span>
            </div>

            <div className="customer-order-meta-grid" style={{ marginTop: 18 }}>
              <div className="customer-order-meta-box">
                <span>Quantidade</span>
                <strong>{order.quantity}</strong>
              </div>

              <div className="customer-order-meta-box">
                <span>Total</span>
                <strong>{money(order.total_amount)}</strong>
              </div>

              <div className="customer-order-meta-box">
                <span>Pagamento</span>
                <strong>{order.payment_provider || "manual"}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h2>Números recebidos</h2>
            <p className="muted-text">
              Estes são os números vinculados ao seu pedido.
            </p>

            {order.numbers?.length ? (
              <div className="customer-number-wall big">
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
      </div>
    </div>
  );
}