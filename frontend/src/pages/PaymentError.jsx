import { Link, useSearchParams } from "react-router-dom";
import FloatingBackground from "../components/FloatingBackground";

export default function PaymentError() {
  const [searchParams] = useSearchParams();
  const order = searchParams.get("order");

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="glass-card">
          <h1>Pagamento não concluído</h1>

          <p className="muted-text">
            O pagamento não foi aprovado ou foi cancelado. Você pode tentar
            comprar novamente.
          </p>

          {order && (
            <p className="muted-text">
              Pedido: <strong>{order}</strong>
            </p>
          )}

          <div style={{ marginTop: 20 }}>
            <Link to="/cliente/rifas">Voltar para minhas rifas</Link>
          </div>
        </div>
      </div>
    </div>
  );
}