export function formatStatusLabel(status) {
  const labels = {
    paid: "Pago",
    pending_payment: "Pendente",
    active: "Ativa",
    draft: "Rascunho",
    paused: "Pausada",
    finished: "Finalizada",
    archived: "Arquivada",
  };

  return labels[status] || status;
}