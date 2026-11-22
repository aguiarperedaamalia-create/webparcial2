import { NavLink, Outlet } from "react-router";

// Diseño común: menú lateral fijo y, a la derecha, la página activa.
export default function Marco() {
  return (
    <div className="marco">
      <aside className="lateral">
        <p className="marca">
          Taller<span>Reparación de equipos</span>
        </p>
        <nav>
          <NavLink to="/" end>
            Resumen
          </NavLink>
          <NavLink to="/ordenes" end>
            Órdenes
          </NavLink>
          <NavLink to="/ordenes/nueva">Recibir equipo</NavLink>
        </nav>
      </aside>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
