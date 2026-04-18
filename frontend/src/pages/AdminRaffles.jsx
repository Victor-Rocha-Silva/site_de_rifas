import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import FloatingBackground from "../components/FloatingBackground";
import ProgressBar from "../components/ProgressBar";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import InlineNotice from "../components/InlineNotice";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useToast } from "../context/ToastContext";
import { money, raffleProgress } from "../utils/format";
import { formatStatusLabel } from "../utils/status";

const TABS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "paused", label: "Pausadas" },
  { key: "finished", label: "Finalizadas" },
  { key: "archived", label: "Arquivadas" },
];

export default function AdminRaffles() {
  const { confirm } = useConfirmDialog();
  const { success, error: showError } = useToast();

  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  async function loadRaffles() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/raffles", {
        params: { show_archived: true },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setRaffles(data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Erro ao carregar rifas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRaffles();
  }, []);

  const counters = useMemo(() => {
    return {
      all: raffles.length,
      active: raffles.filter((r) => r.status === "active").length,
      paused: raffles.filter((r) => r.status === "paused").length,
      finished: raffles.filter((r) => r.status === "finished").length,
      archived: raffles.filter((r) => r.status === "archived").length,
    };
  }, [raffles]);

  const filteredRaffles = useMemo(() => {
    let list = [...raffles];

    if (activeTab !== "all") {
      list = list.filter((r) => r.status === activeTab);
    }

    const term = search.trim().toLowerCase();

    if (term) {
      list = list.filter((r) => {
        const title = (r.title || "").toLowerCase();
        const slug = (r.slug || "").toLowerCase();
        return title.includes(term) || slug.includes(term);
      });
    }

    return list;
  }, [raffles, activeTab, search]);

  async function updateStatus(raffleId, status) {
    const ok = await confirm({
      title: "Alterar status da rifa",
      description: `Deseja realmente mudar o status para "${formatStatusLabel(
        status
      )}"?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setProcessingId(raffleId);
    setError("");

    try {
      await api.put(`/admin/raffles/${raffleId}`, { status });
      success("Status atualizado", "A rifa foi atualizada com sucesso.");
      await loadRaffles();
    } catch (err) {
      const message =
        err.response?.data?.message || "Erro ao atualizar status da rifa.";
      setError(message);
      showError("Falha ao atualizar", message);
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteRaffle(raffle) {
    const ok = await confirm({
      title: "Excluir rifa",
      description: `Deseja excluir "${raffle.title}"? Se houver pedidos, ela pode ser arquivada em vez de apagada.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setProcessingId(raffle.id);
    setError("");

    try {
      const response = await api.delete(`/admin/raffles/${raffle.id}`);
      success("Operação concluída", response.data?.message || "Rifa removida.");
      await loadRaffles();
    } catch (err) {
      const message =
        err.response?.data?.message || "Erro ao excluir a rifa.";
      setError(message);
      showError("Falha ao excluir", message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="admin-premium-page">
      <FloatingBackground />

      <div className="container admin-premium-container">
        <div className="page-header">
          <h1>Rifas</h1>
          <p>Gerencie suas rifas com busca e separação por status.</p>
        </div>

        <div className="glass-card admin-header-actions">
          <div>
            <h2>Gerenciamento de rifas</h2>
            <p className="muted-text">
              Filtre por status, pesquise e gerencie rapidamente.
            </p>
          </div>

          <Link to="/admin/rifas/nova">
            <button>Nova rifa</button>
          </Link>
        </div>

        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label} ({counters[tab.key] || 0})
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ marginBottom: 20 }}>
          <label>Buscar rifa</label>
          <input
            type="text"
            placeholder="Digite o nome ou slug da rifa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <PageLoader
            title="Carregando rifas"
            description="Estamos preparando a lista para você."
          />
        )}

        {!loading && error && (
          <InlineNotice type="error" title="Erro ao carregar">
            {error}
          </InlineNotice>
        )}

        {!loading && !error && filteredRaffles.length === 0 && (
          <EmptyState
            title="Nenhuma rifa encontrada"
            description="Não encontramos rifas com os filtros atuais."
          />
        )}

        {!loading && !error && filteredRaffles.length > 0 && (
          <div className="grid">
            {filteredRaffles.map((raffle) => {
              const progress = raffleProgress(raffle);

              return (
                <div key={raffle.id} className="glass-card admin-raffle-card">
                  <div className="card-row">
                    <div>
                      <h2>{raffle.title}</h2>
                      <p>Slug: {raffle.slug}</p>
                    </div>

                    <span className={`status-badge ${raffle.status}`}>
                      {formatStatusLabel(raffle.status)}
                    </span>
                  </div>

                  <div
                    className="admin-order-meta-grid"
                    style={{ marginTop: 16 }}
                  >
                    <div className="admin-order-meta-box">
                      <span>Total de números</span>
                      <strong>{raffle.total_numbers ?? 0}</strong>
                    </div>

                    <div className="admin-order-meta-box">
                      <span>Valor</span>
                      <strong>{money(raffle.price_per_ticket ?? 0)}</strong>
                    </div>

                    <div className="admin-order-meta-box">
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

                  <div className="admin-actions-wrap">
                    <Link to={`/admin/rifas/${raffle.id}/editar`}>
                      <button>Editar</button>
                    </Link>

                    {raffle.status !== "active" && (
                      <button
                        onClick={() => updateStatus(raffle.id, "active")}
                        disabled={processingId === raffle.id}
                      >
                        {processingId === raffle.id ? "..." : "Ativar"}
                      </button>
                    )}

                    {raffle.status !== "paused" && raffle.status !== "archived" && (
                      <button
                        onClick={() => updateStatus(raffle.id, "paused")}
                        disabled={processingId === raffle.id}
                        style={{ background: "#f59e0b", color: "#111827" }}
                      >
                        {processingId === raffle.id ? "..." : "Pausar"}
                      </button>
                    )}

                    {raffle.status !== "finished" && raffle.status !== "archived" && (
                      <button
                        onClick={() => updateStatus(raffle.id, "finished")}
                        disabled={processingId === raffle.id}
                        style={{ background: "#ef4444", color: "#fff" }}
                      >
                        {processingId === raffle.id ? "..." : "Finalizar"}
                      </button>
                    )}

                    <button
                      onClick={() => deleteRaffle(raffle)}
                      disabled={processingId === raffle.id}
                      style={{ background: "#991b1b", color: "#fff" }}
                    >
                      {processingId === raffle.id ? "..." : "Excluir"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}