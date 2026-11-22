import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listarOrdenes, obtenerResumen } from "../api.js";
import { NOMBRES, TODAS, estaCerrada } from "../taller.js";
import Aviso from "../components/Aviso.jsx";
import TablaOrdenes from "../components/TablaOrdenes.jsx";

// Visión de conjunto: cuántas órdenes hay en cada etapa y qué está pendiente.
export default function Resumen() {
  const [resumen, setResumen] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Trae los datos del servidor al entrar y cada vez que cambia "recarga".
  // Si la página se cierra antes de que llegue la respuesta, se aborta.
  useEffect(() => {
    const control = new AbortController();
    Promise.all([obtenerResumen(control.signal), listarOrdenes(control.signal)])
      .then(([nuevoResumen, nuevasOrdenes]) => {
        setResumen(nuevoResumen);
        setOrdenes(nuevasOrdenes);
        setError("");
      })
      .catch((fallo) => {
        if (fallo.name !== "AbortError") {
          setError(fallo.message);
        }
      });
    return () => control.abort();
  }, [recarga]);

  // Al volver a esta pestaña se piden los datos otra vez, por si alguien
  // cambió algo desde otro navegador.
  useEffect(() => {
    function alVolver() {
      setRecarga((n) => n + 1);
    }
    window.addEventListener("focus", alVolver);
    return () => window.removeEventListener("focus", alVolver);
  }, []);

  // Datos derivados: se calculan a partir del estado, no se guardan.
  const pendientes = ordenes
    .filter((orden) => !estaCerrada(orden.estado))
    .sort((x, y) => (x.created < y.created ? -1 : 1));

  return (
    <section>
      <header className="cabecera">
        <h1>Resumen del taller</h1>
        <button type="button" className="boton" onClick={() => setRecarga(recarga + 1)}>
          Actualizar
        </button>
      </header>

      <Aviso texto={error} />

      {resumen && (
        <ul className="tarjetas">
          {TODAS.map((estado) => (
            <li key={estado}>
              <Link to={"/ordenes?etapa=" + estado} className={"tarjeta tarjeta-" + estado}>
                <strong>{resumen.porEstado[estado] ?? 0}</strong>
                {NOMBRES[estado]}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Trabajo pendiente ({pendientes.length})</h2>
      <TablaOrdenes ordenes={pendientes} vacio="No hay órdenes abiertas." />
    </section>
  );
}
