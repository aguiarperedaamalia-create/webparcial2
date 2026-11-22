import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { listarOrdenes } from "../api.js";
import { NOMBRES, TODAS, coincide } from "../taller.js";
import Aviso from "../components/Aviso.jsx";
import TablaOrdenes from "../components/TablaOrdenes.jsx";

// Lista de órdenes con buscador (para cuando llama un cliente) y filtro
// por etapa. El filtro vive en la URL (?etapa=lista) para poder enlazarlo.
export default function Ordenes() {
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [parametros, setParametros] = useSearchParams();
  const etapa = parametros.get("etapa") || "";
  const buscador = useRef(null);

  useEffect(() => {
    const control = new AbortController();
    listarOrdenes(control.signal)
      .then((lista) => {
        setOrdenes(lista);
        setError("");
      })
      .catch((fallo) => {
        if (fallo.name !== "AbortError") {
          setError(fallo.message);
        }
      });
    return () => control.abort();
  }, []);

  // Al entrar, el cursor queda en el buscador: quien atiende el teléfono
  // puede escribir sin tocar el ratón.
  useEffect(() => {
    buscador.current.focus();
  }, []);

  function cambiarEtapa(evento) {
    const valor = evento.target.value;
    setParametros(valor ? { etapa: valor } : {});
  }

  const visibles = (ordenes || []).filter(
    (orden) => (etapa === "" || orden.estado === etapa) && coincide(orden, busqueda),
  );

  return (
    <section>
      <header className="cabecera">
        <h1>Órdenes</h1>
        <Link className="boton boton-principal" to="/ordenes/nueva">
          Recibir equipo
        </Link>
      </header>

      <div className="filtros">
        <input
          ref={buscador}
          type="search"
          placeholder="Buscar por cliente, teléfono o equipo"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
        <select value={etapa} onChange={cambiarEtapa} aria-label="Etapa">
          <option value="">Todas las etapas</option>
          {TODAS.map((estado) => (
            <option key={estado} value={estado}>
              {NOMBRES[estado]}
            </option>
          ))}
        </select>
      </div>

      <Aviso texto={error} />

      {ordenes === null && !error ? (
        <p className="tenue">Cargando órdenes…</p>
      ) : (
        <TablaOrdenes ordenes={visibles} vacio="Ninguna orden coincide con la búsqueda." />
      )}
    </section>
  );
}
