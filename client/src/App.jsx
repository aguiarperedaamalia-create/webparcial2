import { Route, Routes } from "react-router";
import Marco from "./layouts/Marco.jsx";
import Resumen from "./pages/Resumen.jsx";
import Ordenes from "./pages/Ordenes.jsx";
import NuevaOrden from "./pages/NuevaOrden.jsx";
import OrdenDetalle from "./pages/OrdenDetalle.jsx";
import NoEncontrada from "./pages/NoEncontrada.jsx";

// Todas las páginas son hijas de Marco: el menú lateral se queda fijo y la
// página que toca se pinta dentro de su <Outlet />.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Marco />}>
        <Route index element={<Resumen />} />
        <Route path="ordenes" element={<Ordenes />} />
        <Route path="ordenes/nueva" element={<NuevaOrden />} />
        <Route path="ordenes/:id" element={<OrdenDetalle />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
