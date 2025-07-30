import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Eventos from "./pages/Eventos.jsx";
import Info from "./pages/Info.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 Escucha el estado de autenticación
  useEffect(() => {
    window.onFirebaseAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
  }, []);

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <h2>Debes iniciar sesión para usar la aplicación</h2>
        <button
          onClick={() => window.googleLogin()}
          style={{
            background: "#673ab7",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "60px", minHeight: "100vh" }}>
      <Routes>
        <Route path="/" element={<Eventos />} />
        <Route path="/info" element={<Info />} />
      </Routes>

      {/* Barra inferior */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#fff",
          borderTop: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            flex: 1,
            background: location.pathname === "/" ? "#eee" : "white",
            border: "none",
            fontSize: "1em",
            height: "100%",
          }}
        >
          📅 Eventos
        </button>
        <button
          onClick={() => navigate("/info")}
          style={{
            flex: 1,
            background: location.pathname === "/info" ? "#eee" : "white",
            border: "none",
            fontSize: "1em",
            height: "100%",
          }}
        >
          📖 Info
        </button>
        <button
          onClick={() => window.googleLogout()}
          style={{
            flex: 1,
            background: "#f44336",
            color: "white",
            border: "none",
            fontSize: "1em",
            height: "100%",
          }}
        >
          🚪 Salir
        </button>
      </div>
    </div>
  );
}
