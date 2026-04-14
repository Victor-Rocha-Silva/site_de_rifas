import { Link } from "react-router-dom";
import FloatingBackground from "../components/FloatingBackground";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  return (
    <div className="landing-page">
      <FloatingBackground />

      <section className="landing-hero">
        <div className="container landing-hero-grid">
          <div className="landing-copy">
            <span className="hero-badge">Sua plataforma de rifas</span>

            <h1>
              Organize suas rifas com uma experiência moderna, visual e
              profissional.
            </h1>

            <p>
              Crie campanhas personalizadas, acompanhe pedidos, gerencie números
              e ofereça uma experiência clara para seus clientes.
            </p>

            <div className="landing-actions">
              {!user && (
                <>
                  <Link to="/register">
                    <button>Criar conta</button>
                  </Link>

                  <Link to="/login">
                    <button className="secondary-btn">Entrar</button>
                  </Link>
                </>
              )}

              {isCustomer && (
                <>
                  <Link to="/rifas">
                    <button>Entrar na área</button>
                  </Link>

                  <Link to="/cliente/pedidos">
                    <button className="secondary-btn">Meus pedidos</button>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin">
                    <button>Ir para dashboard</button>
                  </Link>

                  <Link to="/admin/rifas/nova">
                    <button className="secondary-btn">Nova rifa</button>
                  </Link>
                </>
              )}
            </div>

            <div className="landing-mini-info">
              <div className="landing-info-card">
                <strong>Rifas organizadas</strong>
                <span>Controle de pedidos, números e prêmios.</span>
              </div>

              <div className="landing-info-card">
                <strong>Painel privado</strong>
                <span>Somente usuários logados acessam o sistema.</span>
              </div>

              <div className="landing-info-card">
                <strong>Visual premium</strong>
                <span>Banner, logo, tema e página personalizada por rifa.</span>
              </div>
            </div>
          </div>

          <div className="landing-showcase">
            <div className="landing-showcase-card">
              <span className="landing-card-badge">
                {isAdmin
                  ? "Modo administrador"
                  : isCustomer
                  ? "Área do cliente"
                  : "Painel inteligente"}
              </span>

              <h2>
                {isAdmin
                  ? "Seu painel privado está pronto para gerenciar tudo"
                  : isCustomer
                  ? "Sua área já está pronta para acompanhar pedidos e números"
                  : "Uma forma melhor de gerenciar tudo"}
              </h2>

              <p>
                {isAdmin
                  ? "Acesse o dashboard para criar rifas, editar campanhas, aprovar pedidos e acompanhar sua operação."
                  : isCustomer
                  ? "Entre na área interna para ver rifas disponíveis, acompanhar seus pedidos e consultar seus números."
                  : "Administre rifas, acompanhe pedidos e entregue uma experiência mais bonita e organizada para quem participa."}
              </p>

              <div className="landing-showcase-stats">
                <div>
                  <span>Acesso</span>
                  <strong>
                    {isAdmin
                      ? "Admin privado"
                      : isCustomer
                      ? "Conta ativa"
                      : "Conta privada"}
                  </strong>
                </div>

                <div>
                  <span>Área</span>
                  <strong>
                    {isAdmin
                      ? "Dashboard"
                      : isCustomer
                      ? "Rifas internas"
                      : "Clientes e admin"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{user ? "Conectado" : "Pronto para entrar"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="container">
          <div className="page-header">
            <h2>Feito para funcionar de verdade</h2>
            <p>
              Uma base pronta para você usar no seu projeto com cliente e painel
              administrativo.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">01</div>
              <h3>Área do cliente</h3>
              <p>
                Cada cliente acompanha pedidos e números recebidos dentro da
                própria conta.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">02</div>
              <h3>Painel do admin</h3>
              <p>
                Você controla rifas, prêmios, status e pedidos em um só lugar.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">03</div>
              <h3>Rifas personalizadas</h3>
              <p>
                Cada rifa pode ter banner, logo, cores e apresentação própria.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}   