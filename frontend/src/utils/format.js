import { BACKEND_URL } from "../services/api";

export function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path}`;
}

export function raffleProgress(raffle) {
  const total = Number(raffle?.total_numbers || 0);
  const sold = Number(raffle?.sold_numbers_count || 0);

  if (!total) return 0;

  return Math.min(100, Math.round((sold / total) * 100));
}