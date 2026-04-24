import { Link, useSearchParams } from "react-router-dom";
import FloatingBackground from "../components/FloatingBackground";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const order = searchParams.get("order");

  return (
    <div className="customer-premium-page">
      <FloatingBackground />

      <div className="container customer-premium-container">
        <div className="glass-card">
          <h1>Pagamento aprovado!</h1>

          <p className="muted-text">
            Seu pagamento foi recebido. Seus números serão confirmados no
            sistema em instantes.
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