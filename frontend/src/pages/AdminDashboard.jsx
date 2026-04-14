import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [raffles, setRaffles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [rafflesResponse, ordersResponse] = await Promise.all([
          api.get("/admin/raffles"),
          api.get("/admin/orders"),
        ]);

        setRaffles(rafflesResponse.data);
        setOrders(ordersResponse.data);
      } catch {
        setError("Erro ao carregar o painel admin.");
      }
    }

    loadData();
  }, []);

  const metrics = useMemo(() => {
    const totalRaffles = raffles.length;
    const totalOrders = orders.length;
    const paidOrders = orders.filter((item) => item.status === "paid").length;
    const pendingOrders = orders.filter((item) => item.status !== "paid").length;

    return {
      totalRaffles,
      totalOrders,
      paidOrders,
      pendingOrders,
    };
  }, [raffles, orders]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Painel Admin</h1>
        <p>Resumo geral da operação.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="metrics-grid">
        <div className="metric-card">
          <span>Rifas</span>
          <strong>{metrics.totalRaffles}</strong>
        </div>

        <div className="metric-card">
          <span>Pedidos</span>
          <strong>{metrics.totalOrders}</strong>
        </div>

        <div className="metric-card">
          <span>Pagos</span>
          <strong>{metrics.paidOrders}</strong>
        </div>

        <div className="metric-card">
          <span>Pendentes</span>
          <strong>{metrics.pendingOrders}</strong>
        </div>
      </div>

      <div className="glass-card">
        <h2>Últimos pedidos</h2>

        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="admin-list-row">
            <div>
              <strong>Pedido #{order.id}</strong>
              <p>{order.raffle?.title}</p>
            </div>

            <span className={`status-badge ${order.status}`}>{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}