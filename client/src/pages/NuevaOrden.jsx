import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { crearCliente, crearOrden, listarClientes } from "../api.js";
import Aviso from "../components/Aviso.jsx";
import SelectorFotos from "../components/SelectorFotos.jsx";

// Recepción de un equipo: cliente (nuevo o ya registrado), equipo, problema
// y hasta 3 fotos. Todo en un solo formulario controlado.
export default function NuevaOrden() {
  const navegar = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [esNuevo, setEsNuevo] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [equipo, setEquipo] = useState("");
  const [problema, setProblema] = useState("");
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const control = new AbortController();
    listarClientes(control.signal)
      .then((lista) => {
        setClientes(lista);
        // Sin clientes registrados solo queda la opción de crear uno.
        if (lista.length === 0) {
          setEsNuevo(true);
        }
      })
      .catch((fallo) => {
        if (fallo.name !== "AbortError") {
          setError(fallo.message);
        }
      });
    return () => control.abort();
  }, []);

  async function enviar(evento) {
    evento.preventDefault();

    if (esNuevo && (nombre.trim() === "" || telefono.trim() === "")) {
      setError("Escribe el nombre y el teléfono del cliente.");
      return;
    }
    if (!esNuevo && clienteId === "") {
      setError("Elige un cliente o registra uno nuevo.");
      return;
    }
    if (equipo.trim() === "" || problema.trim() === "") {
      setError("Indica el equipo y describe el problema.");
      return;
    }

    setEnviando(true);
    setError("");
    try {
      let cliente = clienteId;
      if (esNuevo) {
        const creado = await crearCliente({ nombre: nombre.trim(), telefono: telefono.trim() });
        cliente = creado.id;
        // Si la orden fallara ahora, el cliente ya existe: se deja elegido
        // para que un segundo intento no lo duplique.
        setClientes([...clientes, creado]);
        setClienteId(creado.id);
        setEsNuevo(false);
      }
      const orden = await crearOrden({
        cliente,
        equipo: equipo.trim(),
        problema: problema.trim(),
        fotos,
      });
      navegar("/ordenes/" + orden.id);
    } catch (fallo) {
      setError(fallo.message);
      setEnviando(false);
    }
  }

  return (
    <section className="estrecho">
      <h1>Recibir equipo</h1>

      <form className="formulario" onSubmit={enviar}>
        <fieldset>
          <legend>Cliente</legend>
          <div className="opciones">
            <label>
              <input
                type="radio"
                name="tipoCliente"
                checked={!esNuevo}
                disabled={clientes.length === 0}
                onChange={() => setEsNuevo(false)}
              />
              Ya registrado
            </label>
            <label>
              <input
                type="radio"
                name="tipoCliente"
                checked={esNuevo}
                onChange={() => setEsNuevo(true)}
              />
              Cliente nuevo
            </label>
          </div>

          {esNuevo ? (
            <div className="dos-columnas">
              <label>
                Nombre
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </label>
              <label>
                Teléfono
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </label>
            </div>
          ) : (
            <label>
              Cliente
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Elegir…</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} — {cliente.telefono}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>Equipo</legend>
          <label>
            Equipo
            <input
              type="text"
              placeholder="Marca y modelo"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
            />
          </label>
          <label>
            Problema que describe el cliente
            <textarea rows="4" value={problema} onChange={(e) => setProblema(e.target.value)} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Fotos del equipo</legend>
          <SelectorFotos fotos={fotos} alCambiar={setFotos} />
        </fieldset>

        <Aviso texto={error} />

        <button type="submit" className="boton boton-principal" disabled={enviando}>
          {enviando ? "Guardando…" : "Registrar orden"}
        </button>
      </form>
    </section>
  );
}
