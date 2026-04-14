import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { money, raffleProgress } from "../utils/format";
import ProgressBar from "../components/ProgressBar";

export default function AdminRaffles() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  async function loadRaffles() {
    try {
      const response = await api.get("/admin/raffles");
      setRaffles(response.data);
    } catch {
      setError("Erro ao carregar as rifas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRaffles();
  }, []);

  async function updateStatus(raffleId, status) {
    setError("");
    setMessage("");
    setProcessingId(raffleId);

    try {
      await api.put(`/admin/raffles/${raffleId}`, { status });
      setMessage(`Rifa atualizada para "${status}" com sucesso.`);
      await loadRaffles();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar status da rifa.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Rifas cadastradas</h1>
        <p>Gerencie o andamento e o status de cada rifa.</p>
      </div>

      {loading && <p>Carregando...</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {raffles.map((raffle) => {
        const progress = raffleProgress(raffle);

        return (
          <div key={raffle.id} className="glass-card">
            <div className="card-row">
              <div>
                <h2>{raffle.title}</h2>
                <p>Slug: {raffle.slug}</p>
              </div>

              <span className={`status-badge ${raffle.status}`}>{raffle.status}</span>
            </div>

            <div className="metrics-grid" style={{ marginTop: 10 }}>
              <div className="metric-card small">
                <span>Total de números</span>
                <strong>{raffle.total_numbers}</strong>
              </div>

              <div className="metric-card small">
                <span>Valor</span>
                <strong>{money(raffle.price_per_ticket)}</strong>
              </div>

              <div className="metric-card small">
                <span>Vendidos</span>
                <strong>{raffle.sold_numbers_count ?? 0}</strong>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="progress-label">
                <span>Progresso</span>
                <strong>{progress}%</strong>
              </div>
              <ProgressBar value={progress} />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Link to={`/admin/rifas/${raffle.id}/editar`}>
                <button>Editar</button>
              </Link>

              {raffle.status !== "active" && (
                <button
                  onClick={() => updateStatus(raffle.id, "active")}
                  disabled={processingId === raffle.id}
                >
                  {processingId === raffle.id ? "Atualizando..." : "Ativar"}
                </button>
              )}

              {raffle.status !== "paused" && (
                <button
                  onClick={() => updateStatus(raffle.id, "paused")}
                  disabled={processingId === raffle.id}
                  style={{ background: "#f59e0b", color: "#111827" }}
                >
                  {processingId === raffle.id ? "Atualizando..." : "Pausar"}
                </button>
              )}

              {raffle.status !== "finished" && (
                <button
                  onClick={() => updateStatus(raffle.id, "finished")}
                  disabled={processingId === raffle.id}
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  {processingId === raffle.id ? "Atualizando..." : "Finalizar"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}