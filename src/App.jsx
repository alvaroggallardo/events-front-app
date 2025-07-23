import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Eventos from "./pages/Eventos.jsx";
import Favoritos from "./pages/Favoritos.jsx";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom: '60px', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Eventos />} />
        <Route path="/favoritos" element={<Favoritos />} />
      </Routes>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#fff',
        borderTop: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            flex: 1,
            background: location.pathname === "/" ? '#eee' : 'white',
            border: 'none',
            fontSize: '1em',
            height: '100%'
          }}
        >
          📅 Eventos
        </button>
        <button
          onClick={() => navigate("/favoritos")}
          style={{
            flex: 1,
            background: location.pathname === "/favoritos" ? '#eee' : 'white',
            border: 'none',
            fontSize: '1em',
            height: '100%'
          }}
        >
          ⭐ Favoritos
        </button>
      </div>
    </div>
  );
}
