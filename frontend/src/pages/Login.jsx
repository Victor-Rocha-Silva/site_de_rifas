import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FloatingBackground from "../components/FloatingBackground";

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    login: "",
    password: "",
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
      const response = await login(form.login, form.password);

      success(
        "Login realizado",
        response.user.role === "admin"
          ? "Bem-vindo ao painel administrativo."
          : "Você entrou na sua área com sucesso."
      );

      if (response.user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      if (redirectTo && redirectTo !== "/login" && redirectTo !== "/register") {
        navigate(redirectTo, { replace: true });
        return;
      }

      navigate("/rifas", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao fazer login.";
      setError(message);
      showError("Falha no login", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FloatingBackground />

      <div className="container auth-layout">
        <div className="auth-showcase">
          <span className="hero-badge">Área de acesso</span>
          <h1>Entre na sua conta e acompanhe tudo em um só lugar.</h1>
          <p>
            Consulte seus pedidos, veja seus números e acompanhe o andamento das
            rifas de forma organizada e visual.
          </p>

          <div className="auth-showcase-cards">
            <div className="auth-mini-card">
              <strong>Cliente</strong>
              <span>Veja seus pedidos e números recebidos.</span>
            </div>

            <div className="auth-mini-card">
              <strong>Admin</strong>
              <span>Gerencie rifas, prêmios e aprovações.</span>
            </div>
          </div>

          {redirectTo && (
            <div className="auth-redirect-note">
              <strong>Você precisa entrar para continuar.</strong>
              <span>Depois do login, você volta para a página que tentou abrir.</span>
            </div>
          )}
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <h2>Entrar</h2>
            <p>Acesse sua conta com e-mail ou telefone.</p>
          </div>

          <label>Login</label>
          <input
            type="text"
            name="login"
            value={form.login}
            onChange={handleChange}
            placeholder="E-mail ou telefone"
          />

          <br /><br />

          <label>Senha</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Sua senha"
          />

          <br /><br />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && <p className="error">{error}</p>}

          <div className="auth-footer-text">
            <span>Ainda não tem conta?</span>
            <Link to="/register" state={redirectTo ? { from: redirectTo } : undefined}>
              Criar cadastro
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}