import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
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
      await registerCustomer(form);
      navigate("/cliente");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao cadastrar.");
    }
  }

  return (
    <div className="container">
      <form className="form card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>

        <label>Nome completo</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <br />
        <br />

        <label>E-mail</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />

        <br />
        <br />

        <label>Telefone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <br />
        <br />

        <label>Senha</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />

        <br />
        <br />

        <label>Confirmar senha</label>
        <input
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={handleChange}
        />

        <br />
        <br />

        <button type="submit">Cadastrar</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}