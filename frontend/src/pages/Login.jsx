import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await login(form.login, form.password);

      if (response.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao fazer login.");
    }
  }

  return (
    <div className="container">
      <form className="form card" onSubmit={handleSubmit}>
        <h1>Entrar</h1>

        <label>Login</label>
        <input
          type="text"
          name="login"
          value={form.login}
          onChange={handleChange}
          placeholder="E-mail ou telefone"
        />

        <br />
        <br />

        <label>Senha</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Sua senha"
        />

        <br />
        <br />

        <button type="submit">Entrar</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}