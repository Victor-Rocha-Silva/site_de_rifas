import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FloatingBackground from "../components/FloatingBackground";

export default function Register() {
  const { registerCustomer, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || null;

  useEffect(() => {
    if (authLoading) return;

    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    if (user) {
      navigate("/rifas", { replace: true });
    }
  }, [user, authLoading, navigate]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerCustomer(form);

      if (redirectTo && redirectTo !== "/login" && redirectTo !== "/register") {
        navigate(redirectTo, { replace: true });
        return;
      }

      navigate("/rifas", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FloatingBackground />

      <div className="container auth-layout">
        <div className="auth-showcase">
          <span className="hero-badge">Cadastro rápido</span>
          <h1>Crie sua conta e participe das rifas com muito mais praticidade.</h1>
          <p>
            Após o cadastro, você poderá acompanhar seus pedidos, visualizar seus
            números e centralizar tudo na sua área do cliente.
          </p>

          <div className="auth-showcase-cards">
            <div className="auth-mini-card">
              <strong>Conta pessoal</strong>
              <span>Seus pedidos ficam salvos e organizados.</span>
            </div>

            <div className="auth-mini-card">
              <strong>Números vinculados</strong>
              <span>Veja exatamente quais números pertencem a você.</span>
            </div>
          </div>

          {redirectTo && (
            <div className="auth-redirect-note">
              <strong>Crie sua conta para continuar.</strong>
              <span>Depois do cadastro, você volta direto para a área que tentou abrir.</span>
            </div>
          )}
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <h2>Criar conta</h2>
            <p>Preencha seus dados para começar.</p>
          </div>

          <label>Nome completo</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
          />

          <br /><br />

          <label>E-mail</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seuemail@exemplo.com"
          />

          <br /><br />

          <label>Telefone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <br /><br />

          <label>Senha</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Crie uma senha"
          />

          <br /><br />

          <label>Confirmar senha</label>
          <input
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Repita a senha"
          />

          <br /><br />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>

          {error && <p className="error">{error}</p>}

          <div className="auth-footer-text">
            <span>Já possui conta?</span>
            <Link to="/login" state={redirectTo ? { from: redirectTo } : undefined}>
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}