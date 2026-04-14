import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Minha área</h1>
        <p>Bem-vindo, {user?.name}.</p>
        <p>E-mail: {user?.email}</p>
        <p>Telefone: {user?.phone || "Não informado"}</p>
      </div>
    </div>
  );
}