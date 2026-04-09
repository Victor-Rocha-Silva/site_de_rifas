import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await api.get("/sanctum/csrf-cookie");

      await api.post("/login", {
        email,
        password,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.log(error);
      alert("Erro ao fazer login");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login Admin</h1>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Senha</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default AdminLogin;