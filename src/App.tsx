import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Actividades from "./pages/Actividades.tsx";
import Alumnos from "./pages/Alumnos.tsx";
import Profesores from "./pages/Profesores";
import Horarios from "./pages/Horarios.tsx";
import Cuotas from "./pages/Cuotas.tsx";
import Reportes from "./pages/Reportes.tsx";
import Configuracion from "./pages/Configuracion.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Actividades" element={<Actividades />} />
        <Route path="/Alumnos" element={<Alumnos />} />
        <Route path="/Profesores" element={<Profesores />} />
        <Route path="/Horarios" element={<Horarios />} />
        <Route path="/Cuotas" element={<Cuotas />} />
        <Route path="/Reportes" element={<Reportes />} />
        <Route path="/Configuracion" element={<Configuracion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
