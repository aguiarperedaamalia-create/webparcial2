import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { cambiarEtapa, listarEventos, obtenerOrden, presupuestar } from "../api.js";
import { fecha, nombreCliente, telefonoCliente } from "../taller.js";
import Acciones from "../components/Acciones.jsx";
import Aviso from "../components/Aviso.jsx";
import FormularioPresupuesto from "../components/FormularioPresupuesto.jsx";
import Fotos from "../components/Fotos.jsx";
import Historial from "../components/Historial.jsx";
import Insignia from "../components/Insignia.jsx";
import Presupuesto from "../components/Presupuesto.jsx";
import Progreso from "../components/Progreso.jsx";

// Ficha de una orden: datos, presupuesto, acciones de la etapa e historial.
// El id sale de la URL (/ordenes/:id).
export default function OrdenDetalle() {
  const { id } = useParams();

  const [orden, setOrden] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [recarga, setRecarga] = useState(0);

  // La orden y su historial se leen siempre del servidor: al entrar, al
  // cambiar de id y después de cada acción (recarga). Así lo que se ve es
  // lo que hay guardado, aunque otro navegador haya movido la orden.
  useEffect(() => {
    const control = new AbortController();
    Promise.all([obtenerOrden(id, control.signal), listarEventos(id, control.signal)])
      .then(([nuevaOrden, nuevosEventos]) => {
        setOrden(nuevaOrden);
        setEventos(nuevosEventos);
      })
      .catch((fallo) => {
        if (fallo.name !== "AbortError") {
          setError(fallo.message);
        }
      });
    return () => control.abort();
  }, [id, recarga]);

  // El título de la pestaña es algo externo a React: se sincroniza con un
  // efecto y se restaura al salir de la página.
  useEffect(() => {
    if (orden) {
      document.title = orden.equipo + " · Taller";
    }
    return () => {
      document.title = "Taller";
    };
  }, [orden]);

  // Ejecuta una acción contra el servidor y vuelve a leer la orden, haya
  // salido bien o mal. No se cambia el estado local "a mano".
  async function ejecutar(accion) {
    setOcupado(true);
    setError("");
    try {
      await accion();
    } catch (fallo) {
      setError(fallo.message);
    }
    setRecarga((n) => n + 1);
    setOcupado(false);
  }

  if (!orden) {
    return (
      <section>
        <Aviso texto={error} />
        {!error && <p className="tenue">Cargando orden…</p>}
        <Link to="/ordenes">← Volver a las órdenes</Link>
      </section>
    );
  }

  const tienePresupuesto = orden.diagnostico !== "";

  return (
    <section>
      <Link to="/ordenes">← Órdenes</Link>

      <header className="cabecera">
        <h1>{orden.equipo}</h1>
        <Insignia estado={orden.estado} />
      </header>

      <Progreso estado={orden.estado} />

      <Aviso texto={error} />

      <div className="ficha">
        <div>
          <article className="panel">
            <h2>Recepción</h2>
            <dl>
              <dt>Cliente</dt>
              <dd>{nombreCliente(orden)}</dd>
              <dt>Teléfono</dt>
              <dd>{telefonoCliente(orden)}</dd>
              <dt>Recibido</dt>
              <dd>{fecha(orden.created)}</dd>
              <dt>Problema</dt>
              <dd>{orden.problema}</dd>
            </dl>
            <Fotos orden={orden} />
          </article>

          {orden.estado === "en_diagnostico" && (
            <article className="panel">
              <h2>Proponer presupuesto</h2>
              <FormularioPresupuesto
                ocupado={ocupado}
                alGuardar={(datos) => ejecutar(() => presupuestar(orden.id, datos))}
              />
            </article>
          )}

          {tienePresupuesto && (
            <article className="panel">
              <h2>Presupuesto</h2>
              <Presupuesto
                diagnostico={orden.diagnostico}
                manoObra={orden.manoObra}
                piezas={orden.piezas}
              />
            </article>
          )}

          <Acciones
            estado={orden.estado}
            ocupado={ocupado}
            alElegir={(etapa) => ejecutar(() => cambiarEtapa(orden.id, etapa))}
          />
        </div>

        <article className="panel">
          <h2>Historial</h2>
          <Historial orden={orden} eventos={eventos} />
        </article>
      </div>
    </section>
  );
}
