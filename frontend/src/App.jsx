import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RaffleDetails from "./pages/RaffleDetails";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerOrderDetails from "./pages/CustomerOrderDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRaffles from "./pages/AdminRaffles";
import AdminCreateRaffle from "./pages/AdminCreateRaffle";
import AdminEditRaffle from "./pages/AdminEditRaffle";
import AdminOrders from "./pages/AdminOrders";
import NotFound from "./pages/NotFound";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          RifaHub
        </Link>

        <div className="nav-links">
          <Link to="/">Início</Link>

          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Cadastro</Link>}

          {user?.role === "customer" && <Link to="/cliente">Minha área</Link>}
          {user?.role === "customer" && <Link to="/cliente/pedidos">Meus pedidos</Link>}

          {user?.role === "admin" && <Link to="/admin">Dashboard Admin</Link>}
          {user?.role === "admin" && <Link to="/admin/rifas">Rifas</Link>}
          {user?.role === "admin" && <Link to="/admin/rifas/nova">Nova rifa</Link>}
          {user?.role === "admin" && <Link to="/admin/pedidos">Pedidos</Link>}
        </div>

        {user && (
          <div className="topbar-user">
            <span>
              {user.name} ({user.role})
            </span>
            <button onClick={logout}>Sair</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rifa/:slug" element={<RaffleDetails />} />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/pedidos"
          element={
            <ProtectedRoute role="customer">
              <CustomerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/pedidos/:publicId"
          element={
            <ProtectedRoute role="customer">
              <CustomerOrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rifas"
          element={
            <ProtectedRoute role="admin">
              <AdminRaffles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rifas/nova"
          element={
            <ProtectedRoute role="admin">
              <AdminCreateRaffle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rifas/:id/editar"
          element={
            <ProtectedRoute role="admin">
              <AdminEditRaffle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}