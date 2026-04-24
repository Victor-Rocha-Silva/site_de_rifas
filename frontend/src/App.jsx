import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
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
import AdminRaffleOrders from "./pages/AdminRaffleOrders";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";
import PaymentPending from "./pages/PaymentPending";

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 30 }}>Carregando...</div>;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user) {
    return <Navigate to="/rifas" replace />;
  }

  return children;
}

function NavbarContent() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActive(path, exact = false) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  const brandTarget = useMemo(() => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin";
    return "/rifas";
  }, [user]);

  const mainAction = useMemo(() => {
    if (!user) {
      return {
        to: "/login",
        label: "Entrar",
        className: "",
      };
    }

    if (user.role === "admin") {
      return {
        to: "/admin/rifas/nova",
        label: "Nova rifa",
        className: "premium-ghost-btn",
      };
    }

    return null;
  }, [user]);

  return (
    <nav className="premium-topbar">
      <div className="premium-topbar-inner">
        <Link to={brandTarget} className="premium-brand" onClick={closeMenu}>
          <span className="premium-brand-mark">R</span>
          <div className="premium-brand-text">
            <strong>Rifex</strong>
            <small>{user ? "área interna" : "landing e acesso"}</small>
          </div>
        </Link>

        <button
          type="button"
          className="premium-menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`premium-nav-shell ${menuOpen ? "open" : ""}`}>
          <div className="premium-nav-links">
            {!user && (
              <>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={isActive("/", true) ? "active" : ""}
                >
                  Página inicial
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={isActive("/login", true) ? "active" : ""}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className={isActive("/register", true) ? "active" : ""}
                >
                  Cadastro
                </Link>
              </>
            )}

            {user?.role === "customer" && (
              <>
                <Link
                  to="/rifas"
                  onClick={closeMenu}
                  className={isActive("/rifas", true) ? "active" : ""}
                >
                  Rifas
                </Link>

                <Link
                  to="/cliente"
                  onClick={closeMenu}
                  className={isActive("/cliente", true) ? "active" : ""}
                >
                  Minha área
                </Link>

                <Link
                  to="/cliente/pedidos"
                  onClick={closeMenu}
                  className={isActive("/cliente/pedidos") ? "active" : ""}
                >
                  Meus pedidos
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={isActive("/admin", true) ? "active" : ""}
                >
                  Página inicial
                </Link>

                <Link
                  to="/admin/rifas"
                  onClick={closeMenu}
                  className={
                    isActive("/admin/rifas") &&
                    !isActive("/admin/rifas/nova", true)
                      ? "active"
                      : ""
                  }
                >
                  Rifas
                </Link>

                <Link
                  to="/admin/pedidos"
                  onClick={closeMenu}
                  className={isActive("/admin/pedidos") ? "active" : ""}
                >
                  Pedidos
                </Link>
              </>
            )}
          </div>

          <div className="premium-topbar-user">
            {user ? (
              <>
                <div className="premium-user-pill">
                  <div className="premium-user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <strong>{user.name}</strong>
                    <small>
                      {user.role === "admin" ? "Administrador" : "Cliente"}
                    </small>
                  </div>
                </div>

                {mainAction && (
                  <Link to={mainAction.to} onClick={closeMenu}>
                    <button className={mainAction.className}>
                      {mainAction.label}
                    </button>
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link to={mainAction.to} onClick={closeMenu}>
                <button>{mainAction.label}</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/rifas"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rifa/:slug"
        element={
          <ProtectedRoute>
            <RaffleDetails />
          </ProtectedRoute>
        }
      />

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
        path="/pagamento/sucesso"
        element={
          <ProtectedRoute role="customer">
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pagamento/erro"
        element={
          <ProtectedRoute role="customer">
            <PaymentError />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pagamento/pendente"
        element={
          <ProtectedRoute role="customer">
            <PaymentPending />
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
        path="/admin/rifas/:raffleId/pedidos"
        element={
          <ProtectedRoute role="admin">
            <AdminRaffleOrders />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavbarContent />
      <AppRoutes />
    </BrowserRouter>
  );
}